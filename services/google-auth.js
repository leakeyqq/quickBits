var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth2' ).Strategy

const User = require('../models/user')
const UserWallet = require('../models/user-wallet')
const InternalAddress = require('../models/internal-addresses')

const config = require('config')
const HDKey = require('hdkey')
const EthereumjsUtil = require('ethereumjs-util')

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
                    .then(async (user) => {
                     await generateNewUserWallet(user)
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
async function generateNewUserWallet(user){
    let newAddressDerivationPath
    const lastAddressDerived = await InternalAddress.findOne().sort('-derivationPath').exec()
    
    if(lastAddressDerived){
        newAddressDerivationPath = lastAddressDerived.derivationPath + 1
    }else{
        newAddressDerivationPath = 0
    }

    const xprv = config.get('hotwallet.xprv')
    const hdkey = HDKey.fromExtendedKey(xprv)
    const childAccount = hdkey.deriveChild(newAddressDerivationPath)
    // Generate address from pub key
    const addressBuffer = EthereumjsUtil.pubToAddress(Buffer.from(childAccount.publicKey, 'hex'), true)
    const child_address = EthereumjsUtil.toChecksumAddress('0x' + addressBuffer.toString('hex'))
    try {

        let internalAddress = new InternalAddress({
            address: child_address,
            parentWallet: config.get('hotwallet.walletName'),
            derivationPath: newAddressDerivationPath
        })
        internalAddress = await internalAddress.save()

        let userWallet = new UserWallet({
            userID: user.id,
            depositAddress: child_address.toLowerCase(),
            'balance.btc': 0,
            'balance.bnb': 0,
            'balance.usdt': 0
        })
        userWallet = await userWallet.save()

    } catch (error) {
        console.error(error)
    }
    
}
