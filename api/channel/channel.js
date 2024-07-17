const session = require('../../session')

const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')


exports.get = async (req, res, next) => { // Gets a logged in user's channels that they are a recieptient of
  let sessionData = await session.current(req)
  console.log('session', sessionData)
  //let user = User.findById(sessionData.id)
  let data;
  data = await Channel.find({recipients: {$in: [new ObjectId(sessionData.id)]}}) // TODO: Sort by last sent message??


  res.status(200).json(data)
}


 
