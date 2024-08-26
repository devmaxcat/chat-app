const session = require('../../session')

const Channel = require('../../schemas/Channel')
const { ObjectId } = require('mongodb')
const { User, ExposableFields } = require('../../schemas/User')


// this might need pagination eventually...
exports.get = async (req, res, next) => { // Gets a logged in user's channels that they are a recieptient of
  let sessionData = req.session?.user


  //let user = User.findById(sessionData.id)
  let data;
  data = await Channel.find({ recipients: { $in: [new ObjectId(sessionData.id)] } }).populate('recipients', ExposableFields, User) // TODO: Sort by last sent message??


  res.status(200).json(data)
}

exports.create = async (req, res, next) => {
  let user = req.session?.user
  const {recipients} = req.body

  await Channel.create({
    owner_id: user._id,
    recipients: recipients,
    name: recipients.join(', '),
    type: 0
  })

}



