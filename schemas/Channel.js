const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const ChannelSchema = new Mongoose.Schema({
    owner_id: { // can be a user or guild..?
        type: ObjectId,
        required: true,
    },
    type: { // 0 is a DM, name is show as the name of other reciepient, 1 is Group DM, name is shown in list and can be renamed
        type: Number,
        default: 0
    },
    name: { // only visible for guild channels or group dms
        type: String,
        default: 'Chat'
    },
    recipients: {
        type: Array,
        default: []
    }
}, {timestamps: true})

const Channel = Mongoose.model("Channel", ChannelSchema)
module.exports = Channel