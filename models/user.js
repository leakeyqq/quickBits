const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    auth_service: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: false
    },
    displayName: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String,
        required: false
    },
    joinedOn: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('User',userSchema, 'user_info')// user_info is the collection name