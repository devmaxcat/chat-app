const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")


const MessageSchema = new Mongoose.Schema({
    text_content: {
        type: String,
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
    }
}, { timestamps: true })

const Message = Mongoose.model("message", MessageSchema)
module.exports = Message