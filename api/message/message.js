const Message = require('../../schemas/Message')
const User = require('../../schemas/User')
const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { io } = require('../../server')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();
console.log('io real2', io)
const cloudinary = require('cloudinary').v2

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

  await Channel.updateOne(
    { _id: req.query.channelid },
    {
      $pull: { lastRead: { user: new ObjectId(sessionData._id) } }
    }
  );

  await Channel.updateOne(
    { _id: req.query.channelid },
    {
      $push: { lastRead: { user: new ObjectId(sessionData._id), timestamp: new Date() } }
    }
  );

  let data;
  if (req.query.cursorid && req.query.cursorid != 'null') {
    data = await Message.find({ _id: { $lt: new ObjectId(req.query.cursorid) }, channel_id: req.query.channelid }).limit(80).populate('author', User.ExposableFields, User).sort({ createdAt: -1 }).lean()
  } else {
    data = await Message.find({ channel_id: req.query.channelid }).limit(80).sort({ createdAt: -1 }).populate('author', User.ExposableFields, User).lean()
  }

  res.setHeader('cache-control', 'max-age=10')
  res.status(200).json(data)


}

exports.search = async (req, res, next) => {
  console.log(req.query.query, new ObjectId(req.query.channelid), req.body.filters)
  let filters = req.body.filters || {}
  let data = await Message.aggregate([
    {
      $search: {
        index: "default",
        text: {
          query: req.query.query,
          path: {
            wildcard: "*",
          },
        },
      },
    },
    {
      $match: {
        author: filters.from ? new ObjectId(filters.from) : { $exists: true },
        channel_id: new ObjectId(req.query.channelid) || { $exists: false },
        system: { $exists: false },
      },
    },
    {
      $project: {
        _id: true,
        author: true,
        channel_id: true,
        createdAt: true,
        media: true,

        text_content: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        "path": "$author",
      }
    },
    {
      $project: {
        ...Message.ExposableFieldsProjection,
        author: User.ExposableFieldsProjection
      }
    }

  ])
  console.log(data)
  res.status(200).json(data)
}


exports.sendSystemMessage = async (channel_id, text_content, level = 0, preset, presetSubs) => {
  let user
  let author = await User.findOne({ username: 'SYS!MSGS' })
  if (!author) {
    author = await User.create({ username: 'SYS!MSGS', email: '', password: 'NO_PASSWORD' })
  }
  let message = await (await Message.create({ channel_id, text_content, author, system: level, metadata: { preset: {type: preset, values: presetSubs} } })).populate('author', User.ExposableFields)
  try {
    let channel = await Channel.findById(channel_id)
    channel.lastActiveTime = new Date().toISOString()
    await channel.save()
  } catch (e) {
    // oh well
  }


  io.to(message.channel_id.toString()).emit("MessageRecieved", message)

}

exports.create = async (req, res) => {
  let user = req.session?.user

  const { channel_id, text_content } = req.body
  const author = user._id
  let media = []
  console.log(req.files, req.file, req.media)

  if (req.files) {


    for (const file of req.files) {
      let filename = file.fieldname

      let parsed = parser.format(filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename, file.buffer).content //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", {
      const result = await cloudinary.uploader.upload(parsed, {
        resource_type: 'auto',
        use_filename: true,
        folder: 'uploads',
        phash: true,
        unique_filename: false,
        context: `original_name=${filename}`
      });
      console.log(result);
      media.push(result)

    }


    //console.log(req.file, uploadResult)

  } else {

  }



  let message = await (await Message.create({ channel_id, text_content, author, media })).populate('author', User.ExposableFields)
  let channel = await Channel.findById(channel_id)
  channel.lastActiveTime = new Date().toISOString()
  await channel.save()
  await Channel.updateOne(
    { _id: channel_id },
    {
      $pull: { lastRead: { user: new ObjectId(user._id) } }
    }
  );

  await Channel.updateOne(
    { _id: channel_id },
    {
      $push: { lastRead: { user: new ObjectId(user._id), timestamp: new Date() } }
    }
  );

  io.to(message.channel_id.toString()).emit("MessageRecieved", message)
  res.status(200).json(message)
}



