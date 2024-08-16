// this schema handles not only friend requests but also modelling connections between users. There should only ever be ONE FriendRequest document per possible connection.

const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const status = {
    PENDING: 0,
    ACCEPTED: 1,
    DENIED: 2,
    CANCELLED: 3,
}
 
const FriendRequestSchema = new Mongoose.Schema({
    from: { 
        type: ObjectId,
        required: true,
    },
    to: { 
        type: ObjectId,
        required: true,
    },
    status: {
        type: Number,
        enum: [status.PENDING, status.ACCEPTED, status.DENIED, status.CANCELLED],
        default: status.PENDING
    }
}, {timestamps: true})

const FriendRequest = Mongoose.model("friendRequest", FriendRequestSchema)
module.exports = FriendRequest