const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")
const User = require("./User")

const ChannelSchema = new Mongoose.Schema({
    owner_id: { // can be a user or guild..?
        type: ObjectId,
        required: true,
    },
    type: { // 0 is a DM, name is show as the name of other reciepient, 1 is Group DM, name is shown in list and can be renamed
        type: Number,
        required: true
    },
    name: { // only visible for guild channels or group dms
        type: String,
        default: 'Chat',
        minlength: 1,
    },
    recipients: [
        {
            type: ObjectId,
            ref: 'User',
        }
    ],
    lastActiveTime: {
        type: Date,
        default: new Date(),
    },
    lastRead: {
        type: Array,
        default: []
    },
    lastMessage: {
        type: ObjectId,
        ref: 'Message',
    },
    meetingParticipants: [
        {
            type: ObjectId,
            ref: 'User',
        }
    ],
    metadata: {
        type: {
            local: {},
        },
       
    }
}, { timestamps: true })

const ExposableFieldsProjection = {
    // all true?
    _id: true,
    owner_id: true,
    type: true,
    name: true,
    recipients: true,
    lastActiveTime: true,
    lastRead: true,
    lastMessage: true,
    meetingParticipants: true,
    createdAt: true,
    updatedAt: true
}

const Channel = Mongoose.model("Channel", ChannelSchema)
module.exports = Channel
module.exports.ExposableFieldsProjection = ExposableFieldsProjection