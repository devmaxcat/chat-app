const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")


const MessageSchema = new Mongoose.Schema({
    text_content: {
        type: String,
        maxLength: 1000
    },
    channel_id: {
        type: ObjectId,
        required: true,
        ref: 'channel'
    }, author: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    media: {
        type: Array
    },
    system: {
        type: Number,
        default: undefined // 0 = notification, single line of text, no pfp. 1 = message from application. 2 = message from us.
    }
}, { timestamps: true })

const Message = Mongoose.model("message", MessageSchema)
module.exports = Message