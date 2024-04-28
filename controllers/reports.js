const mongoose = require('mongoose')
const UserWallet = require('./../models/user-wallet')


const reportForm = (req,res)=>{
    res.render('reports/generate-report')
}
const generate = async(req,res)=>{

    const userID = req.user.id

    const dateRange = {
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
    }

    const includeBTC = req.body.btc_transactions === 'true';
    const includeBNB = req.body.bnb_transactions === 'true';
    const includeUSDT = req.body.usdt_transactions === 'true';


    const transaction_type = req.body.transactionType

    if(transaction_type == 'deposits'){
        let userWallet = await UserWallet.findOne({userID: userID}).lean().exec()

        // Filter deposits within the date range
        let deposits = userWallet.deposits.filter(deposit => {
            // return deposit.timeOccurred >= dateRange.startDate && deposit.timeOccurred <= dateRange.endDate
                // Check if the deposit is within the date range
        const withinDateRange = deposit.timeOccurred >= dateRange.startDate && deposit.timeOccurred <= dateRange.endDate

        const isBTC = deposit.tickerSymbol === 'BTC'
        const isBNB = deposit.tickerSymbol === 'BNB'
        const isUSDT = deposit.tickerSymbol === 'USDT'

        return withinDateRange && ((includeBTC && isBTC) || (includeBNB && isBNB) || (includeUSDT && isUSDT));
        })
        console.log(deposits)
    }

    res.status(200).send('OK')

}
module.exports = { reportForm, generate }

