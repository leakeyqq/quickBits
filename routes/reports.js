const express = require('express')
const router = express.Router()

const { reportForm} = require('./../controllers/reports')
router.get('/generate', reportForm)

module.exports = router