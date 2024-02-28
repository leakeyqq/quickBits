const express = require('express')
const router = express.Router()
const UserWallet = require('./../models/user-wallet')


router.get('/deposit', (req,res)=>{
    res.render('crypto-wallet/deposit')
})
router.get('/balance', async (req,res)=>{
    const userWallet = await UserWallet.findOne({userID: req.user.id}, {balance: 1})
    res.render('crypto-wallet/balance', {userWallet})
})
router.post('/webhook', async (req,res)=>{
    // const blockdata = require('../hey.json')
    const blockdata = req.body
    if(blockdata.confirmed == true){
        console.log(blockdata)
        const listOfTransfers = blockdata.erc20Transfers
        const depositTransaction = listOfTransfers[0]
        console.log(depositTransaction)

        const deposit = {
            tickerSymbol: depositTransaction.tokenSymbol,
            value: depositTransaction.valueWithDecimals,
            txHash: depositTransaction.transactionHash,
            from: depositTransaction.from,
            to: depositTransaction.to,
            timeOccurred: new Date(),
            network_used: 'BEP20',
            transaction_status: 'success'
        }
        const tokenAmount = Number(depositTransaction.valueWithDecimals)
        // Fetch the userwallet
        const userWallet = await UserWallet.findOne({depositAddress: depositTransaction.to})
        if(userWallet){
            const updateObject = {}
            updateObject[`balance.${depositTransaction.tokenSymbol.toLowerCase()}`] = tokenAmount;
            console.log(updateObject)

            await UserWallet.updateOne({userID: userWallet.userID},
            {
                $push: {deposits: deposit},
                $inc: updateObject

            })
        }
    }
    res.status(200).send('OK')
})
router.post('/native', async (req,res)=>{
    console.log(req.body)
    res.status(200).send('OK')
})
module.exports = router