const session = require('../../session')

const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { User, ExposableFields } = require('../../schemas/User')

const { io } = require('../../server')

// this might need pagination eventually...
exports.get = async (req, res, next) => { // Gets a logged in user's channels that they are a recieptient of
  let sessionData = req.session?.user


  //let user = User.findById(sessionData.id)
  let data;
  data = await Channel.find({ recipients: { $in: [sessionData._id] } }).populate('recipients', ExposableFields, User) // TODO: Sort by last sent message??

  console.log('channel get', )
  res.status(200).json(data)
}

exports.create = async (req, res, next) => {
  let user = req.session?.user
  let {recipients} = req.body

  recipients = recipients.map((e) => {return new ObjectId(e)})
  if (!recipients.includes(user._id)) {
      recipients.unshift(user._id)
  }

  let channel = await Channel.create({
    owner_id: user._id,
    recipients: recipients,
    name: 'Group DM',
    type: 1
  })
  
  populatedChannel = await Channel.findOne({_id: channel._id}).populate('recipients', ExposableFields, User) // TODO: Sort by last sent message??
  console.log(channel, populatedChannel)
  channel.name = populatedChannel.recipients.map((e) => {return e.displayName || e.username}).join(', ')
  channel.save()
  channel.recipients.forEach((rid) => {
    io.to(rid).socketsJoin(channel._id);
  })
  
  res.status(200).json({message: 'Channel Created', channel})

}

exports.update = async function(req, res, next) {
  try {
    const user = req.session?.user
    const {channelid, name} = req.body
    console.log(channelid, name)
  
    const channel = await Channel.updateOne({_id: channelid}, {name})
    res.status(200).json({channel, message: 'Channel Updated.'})
  } catch {
    res.status(500).json({error: 'Internal Server Error', message: 'Something went wrong.'})
  }
 
}

exports.add = async function(req, res, next) {
  try {
    const user = req.session?.user
    const {channelid, recipients} = req.body
    console.log(channelid, recipients)
  
    const channel = await Channel.findOne({_id: channelid})
    channel.recipients.push(...recipients.map(e => new ObjectId(e)))
    channel.save()
    res.status(200).json({channel, message: 'Channel Updated.'})
  } catch (err) {
    console.log(err)
    res.status(500).json({error: 'Internal Server Error', message: 'Something went wrong.'})
  }
}

exports.remove = async function(req, res, next) {
  try {
    const user = req.session?.user
    const {channelid, userid} = req.body
    console.log(channelid, userid)
  
    const channel = await Channel.findOne({_id: channelid})
    channel.recipients.filter((e) => e.toString() != userid)
    channel.save()
    res.status(200).json({channel, message: 'Channel Updated.'})
  } catch {
    res.status(500).json({error: 'Internal Server Error', message: 'Something went wrong.'})
  }
}

exports.leave = async function(req, res, next) {
  try {
    const user = req.session?.user
    const {channelid} = req.body
    console.log(channelid)
  
    const channel = await Channel.findOne({_id: channelid})
    channel.recipients = channel.recipients.filter((e) => e.toString() != user._id.toString())
    await channel.save()

    if (channel.recipients.length == 0) {
      await Channel.deleteOne({_id: channel._id})
    }

    res.status(200).json({channel, message: 'Channel Updated.'})
  } catch (err) {
    res.status(500).json({error: 'Internal Server Error', message: 'Something went wrong. ' + err})
  }
}



