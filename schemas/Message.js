const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")


const MessageSchema = new Mongoose.Schema({
    text_content: {
        type: String,
    },
    channel_id: {
        type: ObjectId,
        required: false,
        default: new ObjectId('669819f89601761de9c47648'),
        ref: 'channel'
    }, author: {
        type: ObjectId,
        required: false,
        ref: 'user'
    }
}, { timestamps: true })

const Message = Mongoose.model("message", MessageSchema)
module.exports = Message