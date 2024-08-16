const session = require('../../session')
const Message = require('../../schemas/Message')
const {User, ExposableFields} = require('../../schemas/User')
const { ObjectId } = require('mongodb')
// const activeClients = require('../../gateway').getActiveClients()

exports.update = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = res.locals.user
  
 
  let data = await User.findById(req.query.userid) // NOPE NOPE DB LEAK


  res.setHeader('cache-control', 'max-age=9000')
  res.status(200).json(data)
}