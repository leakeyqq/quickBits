var express = require('express')
var router = express.Router()
const passport = require('passport')
require('./../services/google-auth')

function isLoggedIn(req,res,next){
    // req.user ? next() : res.sendStatus(401)
    req.user ? next() : res.redirect('/form/login')
}

function isLoggedOut(req,res,next){
    if(!req.isAuthenticated()) return next(
        res.redirect('/')
    )
}

router.get("/google", 
    passport.authenticate('google',{scope: ['email', 'profile']})
)

router.get("/google/callback",
    passport.authenticate('google',{
        successRedirect: '/',
        failureRedirect: '/auth/failure'
    })
)

router.get('/failure', (req,res)=>{
    res.send("Something went wrong authenticating")
})

router.post('/logout', (req,res)=>{
    req.logout(function(err){
        if(err) return next(err)
        res.redirect('/')
    })
})

module.exports = router