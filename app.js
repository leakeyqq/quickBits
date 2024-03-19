const express = require('express')
var path = require('path')
const bodyParser = require('body-parser')
const config = require('config')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const Moralis = require('moralis').default

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const cryptoWalletRouter = require('./routes/crypto-wallet')

const app = express()
app.use(bodyParser.json())

app.use(session({
    secret: config.get('session.session-secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60}     // Session to expire after 1 hour
}))
app.use(passport.initialize())
app.use(passport.session())



// Db connection
mongoose.connect(config.get('mongodb.connection_string'))

Moralis.start({
    apiKey: config.get('moralis.streams-api-key')
})


 // Set view engine   
 app.set('view engine', 'ejs')

 // static files
app.use(express.static(path.join(__dirname, 'public')))

// Specify routes
app.use('/',indexRouter)
app.use('/auth', authRouter)
app.use('/crypto-wallet', cryptoWalletRouter)

app.listen(config.get('host.port'),()=>console.info(`App now listening on port ${config.get('host.port')}`))