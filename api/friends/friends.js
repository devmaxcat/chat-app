const session = require('../../session')
const Message = require('../../schemas/Message')
const { User, ExposableFields } = require('../../schemas/User')
const { ObjectId } = require('mongodb')
const FriendRequest = require('../../schemas/FriendRequest')
const Channel = require('../../schemas/Channel')
// const activeClients = require('../../gateway').getActiveClients()

exports.get = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

  let data = await FriendRequest.find({ $and: [{ $or: [{ to: user._id }, { from: user._id }], status: { $nin: [2, 3] } }/*, {status: 0}*/] }).populate('to', ExposableFields, User).populate('from', ExposableFields, User) // get all friend requests that involve the current user
   // find all requests that aren't cancelled or denied (cancelled or denied requests aren't revealed to any client)
  
  // let data = await FriendRequest.find({
  //   $or: [
  //     { $and: [{ to: user._id }, { from: to }, { status: { $nin: [2, 3] } }] },
  //     { $and: [{ to: to }, { from: user._id }, { status: { $nin: [2, 3] } }] }
  //   ]
  // })
  res.status(200).json(data)
}

exports.create = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user
  let effectiveStatus = 0

  const to = req.body.useid ? new ObjectId(req.body.to) : (await User.findOne({ username: req.body.to }))?._id;
  console.log('to', to)
  let request = await FriendRequest.findOne({
    $or: [
      { $and: [{ to: user._id }, { from: to }]},
      { $and: [{ to: to }, { from: user._id }]}
    ]
  }) 
  let message = 'Unknown error occurred';

  if (!to) {
    res.status(400).json({
      error: "User Not Found",
      message: "Couldn't find that user. Double check and try again."
    });
    return
  }

  if (to.equals(user._id)) {
    res.status(400).json({
      error: "Cannot Friend Self",
      message: "You're already friends with yourself! I hope!"
    });
    return

  }

  if (request) {
    console.log(request)

    if (request.status == 1) {
      // users already friends, do nothing
      res.status(400).json({
        error: "Already Friends",
        message: "You're already friends with this person!"
      });
      return


    }
    else if ((request.status == 3 || request.status == 2)) {
      // req already exists, but was cancelled or denied, reupdate to pending
      message = "Friend request sent!"
      await FriendRequest.updateOne(request, { status: 0 })
    }

    else if (request.status == 0 && request.from.equals(user._id)) {
      // req already exists, do nothing

      res.status(400).json({
        error: "Request Exists",
        message: "You're already sent a friend request to this person!"
      });
      return
    }
    else if (request.status == 0 && !request.from.equals(user._id)) {
      // req already exists from other user, assume a mutual want to be friends, set to accepted
      await FriendRequest.updateOne(request, { status: 1 })
      if (!await Channel.findOne({ recipients: { $in: [request.from, request.to]} , type: 0 })) {
        await Channel.create({
          owner_id: request.from,
          recipients: [request.from, request.to],
          name: `DM Between ${request.from} & ${request.to}`,
          type: 0
        })
      }
    
      message = "Friend added!"
      effectiveStatus = 1
    }

  } else {
    message = "Friend request sent!"
    request = await FriendRequest.create({ from: user._id, to: to });
  }


  request.to = to
  request.from = user._id
  request.save()

  res.status(200).json({
    message: message,
    request: request,
    status: effectiveStatus
  });
}

const status = {
  PENDING: 0, // set on creation or re-creation by sender (cannot be set through a responce)
  ACCEPTED: 1, // only set by reciever
  DENIED: 2, // only set by reciever
  CANCELLED: 3, // only set by sender
}

exports.respond = async (req, res, next) => {
  let sessionData = req.session?.user
  let user = req.session?.user

  const id = req.body.id
  const newStatus = req.body.status

  // let request = await FriendRequest.findOne({
  //   $or: [
  //     { $and: [{ to: user._id }, { from: to }] },
  //     { $and: [{ to: to }, { from: user._id }] }
  //   ]
  // })
  let request = await FriendRequest.findOne({
    _id: id
  })

  if (request.from.equals(user._id)) {
    if (newStatus != status.CANCELLED) {
      res.status(401).json({
        error: "Unvalid Action",
        message: "As the sender, you cannot perform this action"
      })
      return
    }
  } else if (request.to.equals(user._id)) {
    console.log(newStatus, status.ACCEPTED, status.DENIED)
    if (!(newStatus == status.DENIED || newStatus == status.ACCEPTED)) {
      res.status(401).json({
        error: "Unvalid Action",
        message: "As the recipient, you cannot perform this action"
      })
      return
    }
    if (newStatus == status.ACCEPTED) {
      if (!await Channel.findOne({ recipients: { $in: [request.from, request.to]} , type: 0 })) {
        await Channel.create({
          owner_id: request.from,
          recipients: [request.from, request.to],
          name: `DM Between ${request.from} & ${request.to}`,
          type: 0
        })
      }

    }
  }

  request.status = newStatus
  request.save()

  res.status(200).json({
    request: request,
    status: newStatus,
    message: "Action Complete"
  })
}



