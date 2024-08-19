const activeClients = []
const session = require('./session');

const { ObjectId } = require('mongodb');

const Channel = require('./schemas/Channel');
const Message = require("./schemas/Message")
const { User, ExposableFields } = require("./schemas/User")

const { resolve } = require('./api/message/message')

const { redis } = require('./database');
const FriendRequest = require('./schemas/FriendRequest');

module.exports = async (socket, io) => {
  let sessionData = socket.request.session.user;
  let user = socket.request.session.user;

  if (!(sessionData && user)) {
    return
  }

  let channels = await Channel.find({ recipients: new ObjectId(user._id) })
  channels.forEach((channel) => {
    socket.join(channel._id.toString()) // join channels
  })
  socket.join(user._id) // join user-specific alerts

  socket.on('MessageSent', async (data) => {
    let message = await Message.findById(data._id).populate('author', ExposableFields, User)
    io.to(message.channel_id.toString()).emit("MessageRecieved", message)
  })

  socket.on('FriendRequestSent', async (data) => {
    let request = await FriendRequest.findById(data._id).populate('to from', ExposableFields, User)
    io.to(request.to._id.toString()).to(request.from._id.toString()).emit("FriendRequestRecieved", request)
  })

  socket.on('FriendRequestResponse', async (data) => {
    const id = data.id
    const newStatus = data.status

    let request = await FriendRequest.findOne({
      _id: id
    })

    if (request.from.equals(user._id)) {
      if (newStatus != 3) {
        socket.emit({ error: 'Invalid Action', message: "As the sender, you cannot perform this action" })
        return
      }
    } else if (request.to.equals(user._id)) {
      if (!(newStatus == 2 || newStatus == 1)) {
        socket.emit({ error: 'Invalid Action', message: "As the recipient, you cannot perform this action" })
        return
      }
      if (newStatus == 1) {
      
        if (!await Channel.findOne({ recipients: { $in: [request.from, request.to]} , type: 0 })) {
          await Channel.create({
            owner_id: request.from,
            recipients: [request.from, request.to],
            name: `DM Between ${request.from} & ${request.to}`,
            type: 0
          })
        }

      }
    }

    request.status = newStatus
    request.save()
    io.to(request.to._id.toString()).to(request.from._id.toString()).emit("FriendRequestSent", request)
  })

  socket.on('FriendRequestRemove', async (data) => {
    const otherid = data.otherid
    console.log(data)
    let request = await FriendRequest.findOneAndDelete({
      $or: [
        { $and: [{ to: user._id }, { from: otherid }] },
        { $and: [{ to: otherid}, { from: user._id }] }
      ]
    }) 
    console.log(request)
    io.to(request.to._id.toString()).to(request.from._id.toString()).emit("FriendRequestSent", request)
  })





  return
  ws.on('message', async function incoming(event) {
    event = JSON.parse(event);
    console.log('received: %s', event);



    if (event.Type == 'MessageEdit') {
      Message.updateOne({ _id: event.Data.message_id }, event.Data.fields)
    }
    // 
    if (event.Type == 'CreateChannel') { // group only, DMs are created automatically
      let user = await User.findById(sessionData.id)
      event.Data.recipients.forEach(async (userid) => {
        let other = await User.findById(userid)
        if (other.friends.includes(user) || other == user) { }
      })
      Channel.create({ owner_id: new ObjectId(sessionData.id), type: 1, name: 'Test' })
    }
    if (event.Type == 'DeleteChannel') { }

    if (event.Type == 'JoinChannel') { }
    if (event.Type == 'LeaveChannel') { }

    if (event.Type == 'AddUserToChannel') { }
    if (event.Type == 'RemoveUserFromChannel') { }
    //
    //
    if (event.Type == 'FriendRequestSent') { }
    if (event.Type == 'CancelFriendRequest') { }
    //
    if (event.Type == 'AcceptFriendRequest') { }
    if (event.Type == 'DeclineFriendRequest') { }

    if (event.Type == 'StartCall') {
      let channel = await Channel.findOne({ _id: event.Data.channelid });
      let recipients = channel.recipients;
      activeClients.forEach(async (ws) => {
        if (recipients.includes(new ObjectId(ws._userId))) {
          ws.send(JSON.stringify({ Type: 'RecievingCall', Data: { notify: event.Data.notify, offer: event.Data.offer, channelid: event.Data.channelid } }))
        }

      })
    }

    if (event.Type == 'AnswerCall') {
      activeClients.forEach(async (ws) => {

        ws.send(JSON.stringify({ Type: 'AnsweredCall', Data: event.Data }))


      })
    }
    if (event.Type == 'ICECandidate') {
      activeClients.forEach(async (ws) => {

        ws.send(JSON.stringify({ Type: 'ICECandidate', Data: event.Data }))


      })
    }


    if (event.Type == 'JoinCall') { }
    if (event.Type == 'LeaveCall') { }

    if (event.Type == 'StatusChanged') { }


  });

  ws.on('close', function close() {
    console.log('Client disconnected');

  });




}