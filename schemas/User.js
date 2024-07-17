const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    
    role: {
        type: String,
        default: "Basic",
        required: true,
    }
})

const User = Mongoose.model("user", UserSchema)
module.exports = User