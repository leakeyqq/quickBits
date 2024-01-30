const express = require('express')
var path = require('path')
const config = require('config')

const indexRouter = require('./routes/index')
const app = express()

 // Set view engine   
 app.set('view engine', 'ejs')

 // static files
app.use(express.static(path.join(__dirname, 'public')))

// Specify routes
app.use('/',indexRouter)

app.listen(config.get('host.port'),()=>console.info(`App now listening on port ${config.get('host.port')}`))