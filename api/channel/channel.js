const session = require('../../session')

const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { User, ExposableFields } = require('../../schemas/User')

const { io } = require('../../server')
const Message = require('../../schemas/Message')

// this might need pagination eventually...
exports.get = async (req, res, next) => { // Gets a logged in user's channels that they are a recieptient of
  let sessionData = req.session?.user
  console.log(sessionData)

  //let user = User.findById(sessionData.id)
  let data;
  data = await Channel.find({ recipients: { $in: [new ObjectId(sessionData._id)] } }).sort({ lastActiveTime: -1 }).populate('recipients', ExposableFields, User).populate('meetingParticipants', ExposableFields, User).lean() // TODO: Sort by last sent message??


  for (let channel of data) {
    //console.log(channel.lastRead, new ObjectId(sessionData._id))

    let lastRead = channel.lastRead.find(read => read.user?.equals(new ObjectId(sessionData._id)))
    if (!lastRead) { lastRead = { user: new ObjectId(sessionData._id), timestamp: channel.createdAt } }
    if (lastRead) {
      let messagesSinceLastRead = await Message.countDocuments({
        channel_id: channel._id,
        createdAt: { $gt: lastRead.timestamp }
      })
      channel.unread = messagesSinceLastRead

    } else {
      channel.unread = 0
    }
    console.log(channel.unread)
  }

  console.log('channel get',)
  res.status(200).json(data)
}

exports.create = async (req, res, next) => {
  let user = req.session?.user
  let { recipients } = req.body

  recipients = recipients.map((e) => { return new ObjectId(e) })
  if (!recipients.includes(user._id)) {
    recipients.unshift(user._id)
  }

  let channel = await Channel.create({
    owner_id: user._id,
    recipients: recipients,
    name: 'Group DM',
    type: 1
  })

  populatedChannel = await Channel.findOne({ _id: channel._id }).populate('recipients', ExposableFields, User) // TODO: Sort by last sent message??
  console.log(channel, populatedChannel)
  channel.name = populatedChannel.recipients.map((e) => { return e.displayName || e.username }).join(', ')
  channel.save()
  channel.recipients.forEach((rid) => {
    io.to(rid.toString()).socketsJoin(channel._id.toString());
    io.to(channel._id.toString()).emit('ChannelUpdate')
  })

  res.status(200).json({ message: 'Channel Created', channel })

}

exports.update = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid, name } = req.body
    console.log(channelid, name)

    const channel = await Channel.updateOne({ _id: channelid }, { name })
    res.status(200).json({ channel, message: 'Channel Updated.' })
  } catch {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong.' })
  }

}

exports.add = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid, recipients } = req.body
    console.log(channelid, recipients)

    const channel = await Channel.findOne({ _id: channelid })
    channel.recipients.push(...recipients.map(e => new ObjectId(e)))
    channel.save()

    channel.recipients.forEach((rid) => {
      io.to(rid.toString()).socketsJoin(channel._id.toString());
      io.to(channel._id.toString()).emit('ChannelUpdate')
    })

    res.status(200).json({ channel, message: 'Channel Updated.' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong.' })
  }
}

exports.remove = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid, userid } = req.body
    console.log(channelid, userid)

    const channel = await Channel.findOne({ _id: channelid })
    channel.recipients.filter((e) => e.toString() != userid)
    channel.save()
    res.status(200).json({ channel, message: 'Channel Updated.' })
  } catch {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong.' })
  }
}

exports.leave = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid } = req.body
    console.log(channelid)

    const channel = await Channel.findOne({ _id: channelid })
    channel.recipients = channel.recipients.filter((e) => e.toString() != user._id.toString())
    await channel.save()

    if (channel.recipients.length == 0) {
      await Channel.deleteOne({ _id: channel._id })
    }



    res.status(200).json({ channel, message: 'Channel Updated.' })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
  }
}

exports.webhook = {}
exports.webhook.callJoined = async function (req, res, next) {
  try {
    const { roomName, externalUserId, meta } = req.body
    console.log(req.body)
    //const user = JSON.parse(meta)
    console.log(user)
    const channel = await Channel.findOne({ _id: room })
    channel.meetingParticipants.push(new ObjectId(externalUserId))
    await channel.save()
    io.to(channel._id.toString()).emit('ChannelUpdate')
    res.status(200).json({ message: 'User joined call', channel })
  }
  catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
  }
}

exports.webhook.callLeft = async function (req, res, next) {
  try {
    const { roomName, externalUserId, meta } = req.body
    console.log(req.body)

    //const user = JSON.parse(meta)
    console.log(user)
    const channel = await Channel.findOne({ _id: room })
    channel.meetingParticipants = channel.meetingParticipants.filter((e) => e != externalUserId)
    await channel.save()
    io.to(channel._id.toString()).emit('ChannelUpdate')
    res.status(200).json({ message: 'User left call', channel })
  }
  catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
  }
}

exports.callJoined = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid } = req.body

    const channel = await Channel.findOne({ _id: channelid })
    channel.meetingParticipants.push(new ObjectId(user._id))
    await channel.save()
    res.status(200).json({ message: 'User joined call', channel })
  }
  catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
  }
}

exports.callLeft = async function (req, res, next) {
  try {
    const user = req.session?.user
    const { channelid } = req.body

    const channel = await Channel.findOne({ _id: channelid })
    console.log(channel.meetingParticipants, user._id)
    channel.meetingParticipants = channel.meetingParticipants.filter((e) => e != user._id)
    console.log(channel.meetingParticipants)
    await channel.save()
    res.status(200).json({ message: 'User left call', channel })
  }
  catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
  }
}


exports.call = async function (req, res, next) { // returns a token to create or join a call
    const user = req.session?.user
    const { channelid } = req.body
    console.log(channelid)
    console.log(req.body)
    const channel = await Channel.findOne({ _id: channelid })
    fetch(`https://${process.env.METERED_DOMAIN}/api/v1/room/${channelid}?secretKey=${process.env.METERED_SECRET_KEY}`, { // Check if room exists
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
      .then((response) => {
        response.json().then(async (response) => {
          console.log(response)
          if (response.message == 'room not found') {
            console.log("room doesn't exist, creating room")
            let response = await fetch(`https://${process.env.METERED_DOMAIN}/api/v1/room?secretKey=${process.env.METERED_SECRET_KEY}`, { // Create room if it doesn't exist
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({

                "roomName": channelid,
                "privacy": "private",
                //"expireUnixSec": 0,
                "ejectAtRoomExp": true,
                //"notBeforeUnixSec": 0,
                "maxParticipants": 0,
                "autoJoin": true,
                "enableRequestToJoin": true,
                "enableChat": false,
                "enableScreenSharing": true,
                "joinVideoOn": false,
                "joinAudioOn": true,
                "recordRoom": false,
                //"ejectAfterElapsedTimeInSec": 0,
                "meetingJoinWebhook": "https://api.devmaxcat.net/api/channel/webhook/callJoined",
                "meetingLeftWebhook": "https://api.devmaxcat.net/api/channel/webhook/callLeft",
                //"endMeetingAfterNoActivityInSec": 300,
                "audioOnlyRoom": false,
              })
            })
            let body = await response.json()
            console.log(body)
            console.log(body?.error?.details)
          }
          console.log("room exists, creating token")
          fetch(`https://${process.env.METERED_DOMAIN}/api/v1/token?secretKey=${process.env.METERED_SECRET_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({

              "roomName": channelid,
              "name": user.displayName,
              "meta": JSON.stringify(user),
              "externalUserId": user._id,
            })
          })
            .then((response) => {
              response.json().then((response) => {
                console.log(response)
                res.status(200).json({ message: 'Call started', token: response.token, response })
              })

            })
            .catch((err) => {
              res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong. ' + err })
            })
        })
      })





  }





