


const cloudinary = require('cloudinary')
const session = require('../../session')
const Message = require('../../schemas/Message')
const { User, ExposableFields } = require('../../schemas/User')
const { ObjectId } = require('mongodb')
const DatauriParser = require('datauri/parser');
const parser = new DatauriParser();


// const activeClients = require('../../gateway').getActiveClients()

exports.getUserProfile = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

}

exports.update = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

  const { displayName, bio } = req.body

  let iconUrl;
  if (req.file) {

    const uploadResult = await cloudinary.uploader.upload(
      parser.format('.png', req.file.buffer).content, { //=> "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", {
      public_id: user.id,
    })
      .catch((error) => {
        console.log(error);
      });
    //console.log(req.file, uploadResult)
    iconUrl = uploadResult.secure_url
  } else {
    iconUrl = user.icon
  }

  await User.updateOne({ _id: user.id }, { displayName: displayName, bio: bio, icon: iconUrl })
  console.log(displayName, bio)
  console.log(iconUrl)

  res.status(200).json({ iconUrl })
}

exports.status = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user
  
  
  const { statusType } = req.body

// if the user sets their status to offline, we shouldn't reveal information about when they might've been active since then.
  let effectiveDate = statusType == 0 ? (user.activityStatus?.date) : new Date().toISOString()

  user.activityStatus = {statusType, date: effectiveDate}
  await user.save()
  console.log(user.activityStatus)
  res.status(200).json({ statusType })
}




