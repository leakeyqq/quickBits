const mongoose = require('mongoose')

const userWalletSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    depositAddress: {
        type: String,
        required: true
    },
    balance: {
        btc: {
            type: Number,
            required: false
        },
        bnb: {
            type: Number,
            required: true
        },
        usdt: {
            type: Number,
            required: true
        }
    },
    deposits: [{
        tickerSymbol: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        txHash: {
            type: String,
            required: true
        },
        from:{
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        timeOccurred: {
            type: Date,
            required: true
        },
        network_used: {
            type: String,
            required: true
        },
        blockConfirmations: {
            type: Number,
            required: false
        },
        transaction_status: {
            type: String,
            required: true,
            enum: ['failed', 'waiting confirmation', 'success']
        }
    }],
    withdrawals: [{
        _id: false,
        ticker: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        txHash: {
            type: String,
            required: true
        },
        from:{
            type: String,
            required: false
        },
        to: {
            type: String,
            required: true
        },
        timeOccurred: {
            type: Date,
            required: true
        },
        network_used: {
            type: String,
            required: true
        },
        transaction_status: {
            type: String,
            required: true,
            enum: ['failed', 'waiting confirmation', 'success']
        }
    }]
})

module.exports = mongoose.model('UserWallet', userWalletSchema, 'user_wallets')