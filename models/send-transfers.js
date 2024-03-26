const mongoose = require('mongoose')

const sendTransferSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    sent: [{
        _id: false,
        tickerSymbol: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        receiver_email: {
            type: String,
            required: true
        },
        eventTime: {
            type: Date,
            required: true
        },
        claimed: {
            type: Boolean,
            required: false
        }
    }],
    received: [{
        _id: false,
        tickerSymbol: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        sender_email: {
            type: String,
            required: true
        },
        eventTime: {
            type: Date,
            required: true
        },
        claimed: {
            type: Boolean,
            required: true
        }
    }]
})

module.exports = mongoose.model('SendTransfer', sendTransferSchema, 'send_transfers')