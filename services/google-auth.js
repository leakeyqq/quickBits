var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth2' ).Strategy;
const User = require('../models/user')
const config = require('config')

const GOOGLE_CLIENT_ID = config.get('google-oauth.client_id')
const GOOGLE_CLIENT_SECRET = config.get('google-oauth.client_secret')
const GOOGLE_CALLBACK_URL = config.get('google-oauth.redirect_uri')

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOne({ email: profile.email })
            .then(existingUser => {
                if (existingUser) {
                return done(null, existingUser)
                } else {
                const user = new User({
                    googleId: profile.id,
                    email: profile.email,
                    displayName: profile.displayName,
                    auth_service: profile.provider,
                    profilePicture: profile.picture,
                    joinedOn: new Date() 
                })
                return user.save()
                    .then((user) => {
                     done(null, user)
                    }
                  )
                
                    .catch(err => done(err))
                }
            })

            .catch(err => done(err))
  }
));

passport.serializeUser(function(user,done){
    done(null,user.id)
})
passport.deserializeUser(function(id,done){
    User.findById(id, {email : 1, displayName : 1, profilePicture: 1})
        .then(user =>{
            return done(null, user)
        })
        .catch(err=> done(err))
})