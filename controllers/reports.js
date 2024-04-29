const mongoose = require('mongoose')
const UserWallet = require('./../models/user-wallet')
const SendTransfer = require('./../models/send-transfers')

const pdf = require('pdf-creator-node')
const fs = require('fs')


const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm"
}
const template = fs.readFileSync("./template/deposits-template.html", "utf-8")
const withdrawalsTemplate = fs.readFileSync("./template/withdrawals-template.html", "utf-8")
const sentTemplate = fs.readFileSync("./template/sent-template.html", "utf-8")
const receivedTemplate = fs.readFileSync("./template/received-template.html", "utf-8")

const reportForm = (req,res)=>{
    res.render('reports/generate-report')
}
const generate = async(req,res)=>{

    const userID = req.user.id
    const userEmail = req.user.email

    const dateRange = {
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
    }
    console.log('inputs are ', req.body)

    const includeBTC = req.body.btc_transactions === 'true';
    const includeBNB = req.body.bnb_transactions === 'true';
    const includeUSDT = req.body.usdt_transactions === 'true';


    const transaction_type = req.body.transactionType

    if(transaction_type == 'deposits'){
        let userWallet = await UserWallet.findOne({userID: userID}).lean().exec()

        // Filter deposits within the date range
        let deposits = userWallet.deposits.filter(deposit => {
                // Check if the deposit is within the date range
        const withinDateRange = deposit.timeOccurred >= dateRange.startDate && deposit.timeOccurred <= dateRange.endDate

        const isBTC = deposit.tickerSymbol === 'BTC'
        const isBNB = deposit.tickerSymbol === 'BNB'
        const isUSDT = deposit.tickerSymbol === 'USDT'

        return withinDateRange && ((includeBTC && isBTC) || (includeBNB && isBNB) || (includeUSDT && isUSDT));
        })


        const document = {
            html: template,
            data: {
                deposits
            },
            path: "./generated-pdfs/deposits-report.pdf"
        }
        pdf.create(document, options).then((fileLocation) => {
            console.log(fileLocation)
            const pdfUrl = '/generated-pdfs/deposits-report.pdf'
            res.redirect(pdfUrl)

        })
        .catch((err) => {
            console.log(err)
        })

    }
    if(transaction_type == 'withdrawals'){
        let userWallet = await UserWallet.findOne({userID: userID}).lean().exec()

        // Filter deposits within the date range
        let withdrawals = userWallet.withdrawals.filter(withdrawal => {
        const withinDateRange = withdrawal.timeOccurred >= dateRange.startDate && withdrawal.timeOccurred <= dateRange.endDate

        const isBTC = withdrawal.ticker === 'BTC'
        const isBNB = withdrawal.ticker === 'BNB'
        const isUSDT = withdrawal.ticker === 'USDT'

        return withinDateRange && ((includeBTC && isBTC) || (includeBNB && isBNB) || (includeUSDT && isUSDT));
        })


        const document = {
            html: withdrawalsTemplate,
            data: {
                withdrawals
            },
            path: "./generated-pdfs/withdrawals-report.pdf"
        }

        pdf.create(document, options).then((fileLocation) => {
            console.log(fileLocation)
            const pdfUrl = '/generated-pdfs/withdrawals-report.pdf'
            res.redirect(pdfUrl)

        })
        .catch((err) => {
            console.log(err)
        })

    }
    if(transaction_type == 'sent'){
        let sendTransfer = await SendTransfer.findOne({userEmail: userEmail}).lean().exec()

        // Filter deposits within the date range
        let sent = sendTransfer.sent.filter(sent_tx => {
        const withinDateRange = sent_tx.eventTime >= dateRange.startDate && sent_tx.eventTime <= dateRange.endDate

        const isBTC = sent_tx.tickerSymbol === 'btc'
        const isBNB = sent_tx.tickerSymbol === 'bnb'
        const isUSDT = sent_tx.tickerSymbol === 'usdt'

        return withinDateRange && ((includeBTC && isBTC) || (includeBNB && isBNB) || (includeUSDT && isUSDT));
        })

        const document = {
            html: sentTemplate,
            data: {
                sent
            },
            path: "./generated-pdfs/sent-report.pdf"
        }

        pdf.create(document, options).then((fileLocation) => {
            console.log(fileLocation)
            const pdfUrl = '/generated-pdfs/sent-report.pdf'
            res.redirect(pdfUrl)

        })
        .catch((err) => {
            console.log(err)
        })

    }
    if(transaction_type == 'received'){
        let sendTransfer = await SendTransfer.findOne({userEmail: userEmail}).lean().exec()

        // Filter deposits within the date range
        let received = sendTransfer.received.filter(received_tx => {
        const withinDateRange = received_tx.eventTime >= dateRange.startDate && received_tx.eventTime <= dateRange.endDate

        const isBTC = received_tx.tickerSymbol === 'btc'
        const isBNB = received_tx.tickerSymbol === 'bnb'
        const isUSDT = received_tx.tickerSymbol === 'usdt'

        return withinDateRange && ((includeBTC && isBTC) || (includeBNB && isBNB) || (includeUSDT && isUSDT));
        })

        const document = {
            html: receivedTemplate,
            data: {
                received
            },
            path: "./generated-pdfs/received-report.pdf"
        }

        pdf.create(document, options).then((fileLocation) => {
            console.log(fileLocation)
            const pdfUrl = '/generated-pdfs/received-report.pdf'
            res.redirect(pdfUrl)

        })
        .catch((err) => {
            console.log(err)
        })

    }

}
module.exports = { reportForm, generate }

