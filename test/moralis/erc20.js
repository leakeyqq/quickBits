const UserWallet = require('../../models/user-wallet')
const { Web3 } = require('web3')
const axios = require('axios')
const config = require('config')
const httpProvider = new Web3.providers.HttpProvider('https://rpc.ankr.com/bsc')
const web3 = new Web3(httpProvider)
const erc20Block = require('./erc20.json')

/**
 * Check if the block is confirmed
 */
const blockConfirmed = erc20Block.confirmed

/**
 * Sort the transaction
 * There is [erc20transfers, native transactions]
 */
if(blockConfirmed) { sort_transaction(erc20Block) }



async function handleErc20transfer(transactions){
    for(const transaction of transactions){
        const depositDetails = {
            txHash: transaction.transactionHash,
            tickerSymbol: transaction.tokenSymbol,
            tokenName: transaction.tokenName,
            contract: transaction.contract,
            value: transaction.valueWithDecimals,
            from: transaction.from,
            to: transaction.to,
            possibleSpam : transaction.possibleSpam,
            depositType: 'erc20 transfer',
        }
        // Should return true/false
        const transaction_successful = await check_transaction_success(transaction.transactionHash)

        if(transaction_successful){
            depositDetails.transaction_successful = true
        }else{
            depositDetails.transaction_successful = false
        }

        console.log('Deposit transaction - erc20 transfer: ', depositDetails)
    }
}
async function handleNativeTransaction(transactions){
    for(const transaction of transactions){
        const depositDetails = {
            txHash: transaction.hash,
            tickerSymbol: 'BNB', // Not sure
            tokenName: 'Binance coin', // Not sure
            contract: '', // Not sure
            value: Web3.utils.fromWei(transaction.value, 'ether'),
            from: transaction.fromAddress,
            to: transaction.toAddress,
            transc_status: transaction.receiptStatus,
            depositType: 'native transaction'
        }

        // Should return true/false
        const transaction_successful = await check_transaction_success(transaction.hash)

        if(transaction_successful){
            depositDetails.transaction_successful = true
        }else{
            depositDetails.transaction_successful = false
        }
        console.log('Deposit transaction - native transaction', depositDetails)
    }
}
async function check_transaction_success(transaction_hash){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${transaction_hash}&apikey=TVZE1K3SU6BNH9G6GJCE83QX4JVB3NA5JA`,
        headers: { }
      }

    const transactionDetails = await axios.request(config)
    const transaction_status = transactionDetails.data.result.status
    if(transaction_status == 1){
            return true
    }else{
            return false
    }
}


function sort_transaction(erc20Block){
    if(erc20Block.erc20Transfers.length > 0 ){
        transactions = erc20Block.erc20Transfers
        handleErc20transfer(transactions)
    }
    if(erc20Block.txs.length > 0 ){
        transactions = erc20Block.txs
        handleNativeTransaction(transactions)
    }
}