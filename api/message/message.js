const Message = require('../../schemas/Message')
const { User, ExposableFields } = require('../../schemas/User')
const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { io } = require('../../server')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
console.log('io real2', io)
const cloudinary = require('cloudinary')

exports.history = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

  if (!req.query.channelid || !ObjectId.isValid(req.query?.channelid)) {
    res.status(400).json({
      message: 'Channel parameter is invalid',
      error: 'An error occurred'
    })
    return
  }

  let channel = await Channel.findById(new ObjectId(req.query?.channelid))

  if (!channel) {
    res.status(403).json({
      message: 'You do not have access to this channel',
      error: 'Forbidden'
    })
    return
  }

  if (!channel.recipients.includes(sessionData._id)) {
    res.status(403).json({
      message: 'You do not have access to this channel',
      error: 'Forbidden'
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
  let media = []
  console.log(req.files, req.file, req.media)
  
  if (req.files) {
   

    for (const file of req.files){
      let filename = file.fieldname
      let parsed = parser.format(filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename, file.buffer).content //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", {
      const result = await cloudinary.uploader.upload(parsed);
      console.log();
      media.push(result)
      
    }

    
    //console.log(req.file, uploadResult)
    
  } else {
  
  }



  let message = await (await Message.create({channel_id, text_content, author, media})).populate('author', ExposableFields)
  
  io.to(message.channel_id.toString()).emit("MessageRecieved", message)
  res.status(200).json(message)
}



