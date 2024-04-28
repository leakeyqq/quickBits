const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})

const { reportForm, generate} = require('./../controllers/reports')
const { isLoggedIn } = require('./../controllers/login-status')


router.get('/generate', reportForm)
router.post('/generate', isLoggedIn, urlencodedParser, generate)

module.exports = router