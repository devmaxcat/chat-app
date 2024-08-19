// NOTE: NEVER EVER DELETE USER RECORDS.
// "Deletion" of an account just deletes all personal data and set fields to inform that this document was deleted.

const Mongoose = require("mongoose")
const { ObjectId } = require("mongodb")
 
const UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    displayName: {
        type: String,
        default: this.username
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    icon: {
        type: String,
    },
    bio: {
        type: String,
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    long_session_identifier: {
        type: String,
        default: '',
        required: false,
    },
    activityStatus: {
        type: Object,
        default: {}, // 0: Offline, 1: Online, -1: N/A To this user
    },
    flags: {

    },
    role: {  
        type: String,
        default: "Basic",
        required: true,
    }
}, {timestamps: true})
UserSchema.index({username: 'text'});
const User = Mongoose.model("user", UserSchema)
const ExposableFields = '_id username displayName icon bio activityStatus createdAt'
const ExposableFieldsProjection = {
    _id: true,
    username: true,
    displayname: true,
    icon: true,
    bio: true,
    activityStatus: true,
    createdAt: true
}

module.exports = User
module.exports.User = User
module.exports.ExposableFields = ExposableFields
module.exports.ExposableFieldsProjection = ExposableFieldsProjection

