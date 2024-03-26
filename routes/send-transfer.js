const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})

const { isLoggedIn, isLoggedOut } = require('./../controllers/login-status')
const { sendForm, getTokenBalance, transferAsset } = require('./../controllers/send-transfers')

router.get('/', isLoggedIn , sendForm)
router.post('/', isLoggedIn , urlencodedParser, transferAsset )
router.get('/token-balance', isLoggedIn ,getTokenBalance)
module.exports = router