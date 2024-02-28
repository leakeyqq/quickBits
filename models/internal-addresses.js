const mongoose = require('mongoose')

const internalAddressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    parentWallet: {
        type: String,
        required: true
    },
    derivationPath: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('internalAddress', internalAddressSchema, 'internal_addresses')