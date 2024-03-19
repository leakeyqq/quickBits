const UserWallet = require('./../models/user-wallet')
const { Web3 } = require('web3')
const config = require('config')
const { check, validationResult } = require('express-validator')

const httpProvider = new Web3.providers.HttpProvider(config.get('crypto.web3-provider.bsc-testnet'))
const web3 = new Web3(httpProvider)

const privKey = '0x38c7a630416e7bebfa9f648067ddf68beacad3edae36a388f3df753a953414a4'
const account = web3.eth.accounts.wallet.add(privKey)

const getBalance = async(req, res)=>{
    const userWallet = await UserWallet.findOne({userID: req.user.id}, {balance: 1, deposits: 1, withdrawals: 1})
    res.render('crypto-wallet/balance', {userWallet})
}
const getDepositPage = async(req,res)=>{
    const tickerSymbol = req.params.tickerSymbol
    const userWallet = await UserWallet.findOne({userID: req.user.id})
    const depositAddress = userWallet.depositAddress
    res.render('crypto-wallet/deposit', {tickerSymbol, depositAddress})
}
const getWithdrawalPage = async(req,res)=>{
    const userID = req.user.id
    const tickerSymbol = req.params.tickerSymbol
    const tickerSymbol_lowercase = tickerSymbol.toLowerCase()
    let transaction_fee = getTransactionFee(tickerSymbol.toUpperCase())
    const userWallet = await UserWallet.findOne({userID: userID})

    const balance = userWallet.balance[tickerSymbol_lowercase]

    res.render('crypto-wallet/withdraw', {tickerSymbol, transaction_fee, balance})
}
const validateWithdrawal = [
check('amountToWithdraw', 'Invalid amount')
    .notEmpty(),
check('receiver', 'Invalid receiving address')
    .notEmpty()
]
const withdrawAsset = async(req,res)=>{
    const userID = req.user.id
    const tickerSymbol = req.params.tickerSymbol.toLowerCase()
    const withdrawalAmount = Number(req.body.amountToWithdraw)
    let transaction_fee = getTransactionFee(tickerSymbol.toUpperCase())
    const totalToDeduct = withdrawalAmount + transaction_fee

    const errors = validationResult(req)

    const userWallet = await UserWallet.findOne({userID: userID})
    const assetBalance = userWallet.balance[tickerSymbol]
    if(assetBalance < totalToDeduct){
        errors.errors.push({msg: 'Insufficient balance'})
    }
    if(!errors.isEmpty()){
        // TODO
    }{
        const tickerSymbol_in_upperCase = tickerSymbol.toUpperCase()
        if(tickerSymbol_in_upperCase == 'BNB'){
            const transactionHash = await withdraw_BNB(req)
            console.log(transactionHash)
            // Update userwallet balance
            await update_userWallet_afterWithdrawal(req, totalToDeduct, transactionHash)
            res.redirect('/crypto-wallet/balance')
        }
    }
}
const moralis_incoming_transaction = async(req, res)=>{
    const blockdata = req.body

    if(blockdata.confirmed == false){
        console.log(blockdata)
        sortTransaction(blockdata)
    }
    res.status(200).send('OK')
}
function sortTransaction(blockchain_block){
    if(blockchain_block.erc20Transfers.length > 0){
        const transactions = blockchain_block.erc20Transfers
        handleERC20Transfers(transactions)
    }
    if(blockchain_block.txs.length > 0){
        const transactions = blockchain_block.txs
        handleNativeTransfers(transactions)
    }
}
async function handleERC20Transfers(transactions){
    for(const depositTransaction of transactions){
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
}
async function handleNativeTransfers(transactions){
    for(const depositTransaction of transactions){
        // Verify that is is a BNB transfer
        if(depositTransaction.input == "0x" && depositTransaction.value > 0){

            const token_value = Web3.utils.fromWei(depositTransaction.value, 'ether')
          
            const deposit = {
                tickerSymbol: 'BNB',
                value: token_value,
                txHash: depositTransaction.hash,
                from: depositTransaction.fromAddress,
                to: depositTransaction.toAddress,
                timeOccurred: new Date(),
                network_used: 'BEP20',
                transaction_status: 'success'
            }
            const tokenAmount = Number(token_value)
            const userWallet = await UserWallet.findOne({depositAddress: depositTransaction.toAddress})
            if(userWallet){
                const updateObject = {}
                updateObject[`balance.bnb`] = tokenAmount;
                console.log(updateObject)
    
                await UserWallet.updateOne({userID: userWallet.userID},
                {
                    $push: {deposits: deposit},
                    $inc: updateObject
    
                })
            }
        }
    }   
}
function getTransactionFee(tickerSymbol){
    let transaction_fee

    switch(tickerSymbol) {
        case 'BTC':
            transaction_fee = 0.0000016
          break;
        case 'BNB':
            transaction_fee = 0.00019
          break;
          case 'USDT':
            transaction_fee = 0.1
            break;
        default:
            transaction_fee = 0
      }

    return transaction_fee
}
async function withdraw_BNB(req){
    const tx = {
        from: account[0].address,
        to: req.body.receiver,
        value: web3.utils.toWei(req.body.amountToWithdraw, 'ether'),
        gasPrice: web3.utils.toWei(config.get('crypto.bscscan.gas-price'), 'Gwei'),
        gas: config.get('crypto.bscscan.gas-limit')
    }
    let gottenHash
    await web3.eth.sendTransaction(tx)
        .on('transactionHash', (transactionHash)=>{
            gottenHash = transactionHash
        })
        .on('error', (error)=>{
            throw new Error('transaction failed ', error)
        })
    return gottenHash
}
async function update_userWallet_afterWithdrawal(req, totalToDeduct, txHash){
    const userID = req.user.id
    const totalAmountToDeduct = Number(totalToDeduct)
    const amountToSend = Number(req.body.amountToWithdraw)
    const tickerSymbol_in_upper = req.params.tickerSymbol.toUpperCase()
    const tickerSymbol_lower = req.params.tickerSymbol.toLowerCase()

    const withdrawal = {
        ticker: tickerSymbol_in_upper,
        value: amountToSend,
        txHash: txHash,
        to: req.body.receiver,
        timeOccurred: new Date(),
        network_used: 'BEP20',
        transaction_status: 'waiting confirmation'
    }

    await UserWallet.updateOne({userID: userID},
        {
            $inc: {
                [`balance.${tickerSymbol_lower}`]: -totalAmountToDeduct
            },
            $push: {
                withdrawals: withdrawal
            }
        }
        )
}
module.exports = { getBalance, getDepositPage, validateWithdrawal,
                  moralis_incoming_transaction, getWithdrawalPage,
                  withdrawAsset
}