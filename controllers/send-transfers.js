require('dotenv').config()
const config = require('config')
const mongoose = require('mongoose')
const SendTransfer = require('./../models/send-transfers')
const UserWallet = require('./../models/user-wallet')
const User = require('./../models/user')
const nodemailer = require('nodemailer')


const sendForm = async(req,res)=>{
    const sendWallet = await SendTransfer.findOne({userEmail: req.user.email})
    res.render('send/fill', { sendWallet})
}
const transferAsset = async(req,res)=>{
    try {
        // INPUTS
        const senderID = req.user.id
        const senderEmail = req.user.email
        const receiverEmail = req.body.receiverEmail
        const tickerSymbol = req.body.asset
        const amount_to_send = Number(req.body.amount)
    
    
        // VERIFY BALANCE IS SUFFICIENT
        const userWallet = await UserWallet.findOne({userID: senderID})
        const tokenBalance = userWallet.balance[tickerSymbol]
        if(tokenBalance < amount_to_send) throw new Error('Insufficient balance')

    
        await confirm_send_accounts_exists(senderEmail, receiverEmail)
        const userWallet_exists = await check_receiver_userWallet_exists(receiverEmail)
        await register_new_transaction(senderEmail, receiverEmail, tickerSymbol, amount_to_send, userWallet_exists)
        if(userWallet_exists){
            await update_userWallet_of_receiver(receiverEmail, tickerSymbol, amount_to_send)
        }
        await update_sender_userWallet(senderID, tickerSymbol, amount_to_send)

        send_email_to_transaction_receiver(receiverEmail, senderEmail, amount_to_send, tickerSymbol)

        res.redirect('/send')
       
    } catch (error) {
        console.error(error)
    }

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
    let senderAccount = await SendTransfer.findOne({userEmail: senderEmail})
    if(!senderAccount){
        // initialize
        senderAccount = new SendTransfer({
            userEmail: senderEmail
        })
        await senderAccount.save()
    }
    // Check if receiver exists in send_transfers records
    let receiverAccount = await SendTransfer.findOne({userEmail: receiverEmail})
    if(!receiverAccount){
        // initialize
        receiverAccount = new SendTransfer({
            userEmail: receiverEmail
        })
        await receiverAccount.save()
    }
}
async function check_receiver_userWallet_exists(receiver_email){
    const user = await User.findOne({email: receiver_email})
    if(user == null){
        return false
    }else{
        return true
    }
}
async function register_new_transaction(sender_email, receiver_email, tickerSymbol, amount, userWallet_exists){
    const sendTransaction = {
        tickerSymbol: tickerSymbol,
        amount: amount,
        receiver_email: receiver_email,
        eventTime: new Date(),
        claimed: userWallet_exists
    }

    const receiveTransaction = {
        tickerSymbol: tickerSymbol,
        amount: amount,
        sender_email: sender_email,
        eventTime: new Date(),
        claimed: userWallet_exists
    }
    try {
        // Save the sender transaction
        await SendTransfer.updateOne({userEmail: sender_email},
            {
                $push: {sent: sendTransaction}
            })

        // Save the receiver transaction
        await SendTransfer.updateOne({userEmail: receiver_email},
            {
                $push: {received: receiveTransaction}
            })

    } catch (error) {
        console.error(error)
    }
}
async function update_userWallet_of_receiver(receiverEmail, tickerSymbol, amount_to_send){
    const user = await User.findOne({email: receiverEmail})
    const userID = user.id

    const updateObject = {}
    updateObject[`balance.${tickerSymbol}`] = amount_to_send


    await UserWallet.updateOne({userID: userID},
        {
            $inc: updateObject
        })
}
async function update_sender_userWallet(senderID, tickerSymbol, amount_to_send){
    const updateObject = {}
    updateObject[`balance.${tickerSymbol}`] =  -amount_to_send

    try {
        await UserWallet.updateOne({userID: senderID},
            {
                $inc: updateObject
            })     
    } catch (error) {
        console.error(error)
    }
}

async function send_email_to_transaction_receiver(receiverEmail, senderEmail, amount_to_send, tickerSymbol){
    const email = process.env.EMAIL_TO_USE
    const email_pswd = process.env.EMAIL_PASSWORD

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: email_pswd
        }
    })

    let mailOptions = {
        from: '"QUICKBITS APP" <' + email + '>',
        to: receiverEmail,
        subject: `RECEIVED ${amount_to_send} ${tickerSymbol.toUpperCase()}`,
        text: `You have received ${amount_to_send} ${tickerSymbol.toUpperCase()} from ${senderEmail}. Sigup/Login to QuickBits app to access your funds.`
    }

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.error(error)
        }else{
            console.log('Email sent ', + info.response)
        }
    })
}

module.exports = { sendForm, getTokenBalance, transferAsset }