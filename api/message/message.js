const Message = require('../../schemas/Message')
const { User, ExposableFields } = require('../../schemas/User')
const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { io } = require('../../server')
console.log('io real2', io)

exports.history = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

  if (!req.query.channelid) {
    res.status(400).json({
      message: 'No channel id provided',
      error: 'Bad Request'
    })
    return
  }

  let channel = await Channel.findById(req.query.channelid)

  if (!channel.recipients.includes(sessionData._id)) {
    res.status(401).json({
      message: 'You do not have access to this channel',
      error: 'Unauthorized'
    })
    return
  }

  let data;
  if (req.query.cursorid && req.query.cursorid != 'null') {
    data = await Message.find({ _id: { $lt: new ObjectId(req.query.cursorid) }, channel_id: req.query.channelid }).limit(80).populate('author', ExposableFields, User).sort({ createdAt: -1 }).lean()
  } else {
    data = await Message.find({ channel_id: req.query.channelid }).limit(80).sort({ createdAt: -1 }).populate('author', ExposableFields, User).lean()
  }

  res.setHeader('cache-control', 'max-age=10')
  res.status(200).json(data)

  
}

exports.create = async (req, res, next) => {
  let user = req.session?.user

  const { channel_id, text_content } = req.body
  const author  = user._id

  let message = await (await Message.create({channel_id, text_content, author})).populate('author', ExposableFields)
  
  io.to(message.channel_id.toString()).emit("MessageRecieved", message)
  res.status(200).json(message)
}



