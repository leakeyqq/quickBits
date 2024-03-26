const express = require('express')
const router = express.Router()

const { isLoggedIn, isLoggedOut } = require('./../controllers/login-status')
const { sendForm, getTokenBalance } = require('./../controllers/send-transfers')

router.get('/', isLoggedIn , sendForm)
router.post('/')
router.get('/token-balance', isLoggedIn ,getTokenBalance)
module.exports = router