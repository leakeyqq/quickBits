const express = require('express')
var path = require('path')
require('dotenv').config()
const bodyParser = require('body-parser')
const config = require('config')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const Moralis = require('moralis').default

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const cryptoWalletRouter = require('./routes/crypto-wallet')
const sendRouter = require('./routes/send-transfer')
const reportRouter = require('./routes/reports')

const app = express()
app.use(bodyParser.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60}     // Session to expire after 1 hour
}))
app.use(passport.initialize())
app.use(passport.session())



// Db connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)


Moralis.start({
    apiKey: process.env.MORALIS_STREAMS_API_KEY
})


 // Set view engine   
 app.set('view engine', 'ejs')

 // static files
app.use(express.static(path.join(__dirname, 'public')))

// Specify routes
app.use('/',indexRouter)
app.use('/auth', authRouter)
app.use('/crypto-wallet', cryptoWalletRouter)
app.use('/send', sendRouter)
app.use('/reports', reportRouter)

app.listen(process.env.APP_RUNNING_PORT,()=>console.info(`App now listening on port ${process.env.APP_RUNNING_PORT}`))

module.exports = app