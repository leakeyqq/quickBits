const mongoose = require('mongoose')
const SendTransfer = require('./../models/send-transfers')
const UserWallet = require('./../models/user-wallet')

const sendForm = async(req,res)=>{
    res.render('send/fill')
}
const sendTransfer = async(req,res)=>{
    
    const senderEmail = req.user.email
    const receiverEmail = req.body.receiverEmail

    await confirm_send_accounts_exists(senderEmail, receiverEmail)
    await register_new_transaction()


}
const getTokenBalance = async(req,res)=>{
    try {
        const userID = req.user.id
        const tickerSymbol = req.query.tickerSymbol
        let userWallet = await UserWallet.findOne({userID: userID})
        const tokenBalance = userWallet.balance[tickerSymbol]

        res.json({tokenBalance})   
    } catch (error) {
        console.error(error)
    }

}
async function confirm_send_accounts_exists(senderEmail, receiverEmail){
    // Check if sender exists in send_transfers records
    let senderAccount = await SendTransfer({userEmail: senderEmail})
    if(!senderAccount){
        // initialize
        senderAccount = new SendTransfer({
            userEmail: senderEmail
        })
        await senderAccount.save()
    }
    // Check if receiver exists in send_transfers records
    let receiverAccount = await SendTransfer({userEmail: receiverEmail})
    if(!receiverAccount){
        // initialize
        receiverAccount = new SendTransfer({
            userEmail: receiverEmail
        })
        await receiverAccount.save()
    }
}

module.exports = { sendForm, getTokenBalance }