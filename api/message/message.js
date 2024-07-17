const session = require('../../session')
const Message = require('../../schemas/Message')
const User = require('../../schemas/User')
// const activeClients = require('../../gateway').getActiveClients()

exports.history = async (req, res, next) => {
  let sessionData = await session.current(req)
  console.log('session', sessionData)
  //let user = User.findById(sessionData.id)
  let data;
  if (req.query.cursorid && req.query.cursorid != 'null') {
    data = await Message.find({ _id: { $lt: new ObjectId(req.query.cursorid) }, channel_id: req.query.channelid }).limit(20).sort({ createdAt: -1 })
  } else {
    data = await Message.find({ channel_id: req.query.channelid }).limit(20).sort({ createdAt: -1 })
  }


  res.status(200).json(data)
}


 
