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
    mentions: {
        type: {
            users: {
                type: Array,
                default: []
            },
            channels: {
                type: Array,
                default: []
            }
        },
        required: false
    },
    media: {
        type: Array
    },
    system: { // shows a message as coming from the system, not a user.
        type: Number,
        default: undefined // 0 = notification, single line of text, no pfp. 1 = message from application. 2 = message from us (company).
    },
    metadata: {
        preset: { // allows you to set a preset which corrosponds to the text that should be displayed instead of the text_content
            type: {
                type: String
            },
            values: {
                type: Array
                
            }
        },
    }
}, { timestamps: true })

const Message = Mongoose.model("message", MessageSchema)
module.exports = Message
module.exports.ExposableFieldsProjection = {
    _id: true,
    text_content: true,
    channel_id: true,
    media: true,
    system: true,
    createdAt: true,
    updatedAt: true,
    metadata: true,
    mentions: true
}