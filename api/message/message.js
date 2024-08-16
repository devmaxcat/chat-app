const session = require('../../session')
const Message = require('../../schemas/Message')
const { User, ExposableFields } = require('../../schemas/User')
const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
// const activeClients = require('../../gateway').getActiveClients()

let dbCache = [] // cache database queries for repeat entries

// exports.resolve = async (leanMessage) => { // adds extra information to a message with more database queries
//   console.log(leanMessage)
//   leanMessage = JSON.stringify(leanMessage)
//   leanMessage = JSON.parse(leanMessage)
//   let userData;
//   let cachedData = dbCache.find((e) => e?._id?.equals(leanMessage.author))

//   if (cachedData?.expiry < Date.now() || !cachedData) {
//     userData = await User.findById(leanMessage.author).lean()
//     if (cachedData) {
//       dbCache[dbCache.indexOf(catchedData)] == {userData, expiry: Date.now() + 300000}
//     } else {
//       dbCache.push({userData, expiry: Date.now() + 300000})
//     }
//   } else if (cachedData) {
//     userData = cachedData.userData
//   } 
//   console.log('RAHHHHH', userData)
//   leanMessage.author_id = userData._id

//   leanMessage.author = {
//     id: userData._id,
//     username: userData.username,
//   }
//   return leanMessage
// }


exports.history = async (req, res, next) => {
  let sessionData = req.session?.user




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

 


  // for (let i = 0; i < data.length; i++) {
  //   data[i] = await exports.resolve(data[i]) 
  // }


  res.setHeader('cache-control', 'max-age=10')
  res.status(200).json(data)
}

exports.create = async (req, res, next) => {
  let sessionData = req.session?.user

  const { channel_id, text_content } = req.body
  const author  = sessionData.id

  let message = await Message.create({channel_id, text_content, author})
  

  res.status(200).json(message)
}



