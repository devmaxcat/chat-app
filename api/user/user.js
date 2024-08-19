const session = require('../../session')
const Message = require('../../schemas/Message')
const { User, ExposableFields, ExposableFieldsProjection } = require('../../schemas/User')
const { ObjectId } = require('mongodb')
// const activeClients = require('../../gateway').getActiveClients()

exports.search = async (req, res, next) => {
  console.log(req.query.query)
  let data = await User.aggregate([
    {
      $search: {
        index: "default",
        autocomplete: {
          query: req.query.query,
          path: "username"
        }
      }
    },
    { $project: ExposableFieldsProjection }
  ]).limit(req.query.limit || 10)
  res.status(200).json(data)
}

exports.update = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = res.locals.user


  let data = await User.findById(req.query.userid) // NOPE NOPE DB LEAK


  res.setHeader('cache-control', 'max-age=9000')
  res.status(200).json(data)
}