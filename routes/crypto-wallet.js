const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})

const { isLoggedIn, isLoggedOut } = require('./../controllers/login-status')
const { getBalance, getDepositPage, moralis_incoming_transaction, 
    getWithdrawalPage, validateWithdrawal, withdrawAsset } = require('./../controllers/crypto-wallet')


// router.get('/deposit/:tickerSymbol', (req,res)=>{
//     res.render('crypto-wallet/deposit')
// })
router.get('/deposit/:tickerSymbol', isLoggedIn, getDepositPage)
router.get('/balance', isLoggedIn, getBalance)
router.post('/webhook', moralis_incoming_transaction)
router.get('/withdraw/:tickerSymbol', isLoggedIn ,getWithdrawalPage)
router.post('/withdraw/:tickerSymbol', isLoggedIn, urlencodedParser , validateWithdrawal, withdrawAsset)
module.exports = router