const express = require('express')
const router = express.Router()

const { isLoggedIn, isLoggedOut } = require('./../controllers/login-status')
const { getBalance, getDepositPage, moralis_incoming_transaction, getWithdrawalPage } = require('./../controllers/crypto-wallet')


// router.get('/deposit/:tickerSymbol', (req,res)=>{
//     res.render('crypto-wallet/deposit')
// })
router.get('/deposit/:tickerSymbol', isLoggedIn, getDepositPage)
router.get('/balance', isLoggedIn, getBalance)
router.post('/webhook', moralis_incoming_transaction)
router.get('/withdraw/:tickerSymbol', isLoggedIn ,getWithdrawalPage)
module.exports = router