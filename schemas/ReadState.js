const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const ChannelSchema = new Mongoose.Schema({
    channel_id: {
        type: ObjectId, 
        required: true,
    },
    user: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const Channel = Mongoose.model("Channel", ChannelSchema)
module.exports = Channel