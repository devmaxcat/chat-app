const activeClients = []
const session = require('./session');

const { ObjectId } = require('mongodb');

const Channel = require('./schemas/Channel');
const Message = require("./schemas/Message")
const { User, ExposableFields } = require("./schemas/User")

const { resolve } = require('./api/message/message')

const { redis } = require('./database');
const FriendRequest = require('./schemas/FriendRequest');

// module.exports.getActiveClients = function () {
//   return activeClients
// } -- this might be unneeded...??


module.exports = async (socket, io) => {
  //console.log(socket.request)
  // const sessionData = await session.current(socket.request);
  let sessionData = socket.request.session.user;
  let user = socket.request.session.user;
  //const user = await User.findOne({ _id: sessionData.id })
  //console.log(sessionData)
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
    console.log('sending to ... ' + message.channel_id.toString())
    io.to(message.channel_id.toString()).emit("MessageRecieved", message)

  })

  socket.on('FriendRequestSent', async (data) => {
    let request = await FriendRequest.findById(data._id).populate('to from', ExposableFields, User)
    console.log('transmitting req to: ' + request.to._id.toString())

    io.to(request.to._id.toString()).to(request.from._id.toString()).emit("FriendRequestRecieved", request)
  })

  socket.on('FriendRequestResponse', async (data) => {

    const id = data.id
    const newStatus = data.status

    let request = await FriendRequest.findOne({
      _id: id
    })

    if (request.from.equals(user._id)) {
      if (newStatus != status.CANCELLED) {
        socket.emit({ error: 'Invalid Action', message: "As the sender, you cannot perform this action" })
        return
      }
    } else if (request.to.equals(user._id)) {
      if (!(newStatus == status.DENIED || newStatus == status.ACCEPTED)) {
        socket.emit({ error: 'Invalid Action', message: "As the recipient, you cannot perform this action" })
        return
      }
      if (newStatus == status.ACCEPTED) {
        if (!await Channel.findOne({ recipients: [request.from, request.to], type: 0 })) {
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