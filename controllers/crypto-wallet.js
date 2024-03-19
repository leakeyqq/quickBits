const UserWallet = require('./../models/user-wallet')
const { Web3 } = require('web3')
const config = require('config')

const httpProvider = new Web3.providers.HttpProvider(config.get('crypto.web3-provider.bsc-testnet'))
const web3 = new Web3(httpProvider)

const getBalance = async(req, res)=>{
    const userWallet = await UserWallet.findOne({userID: req.user.id}, {balance: 1, deposits: 1})
    res.render('crypto-wallet/balance', {userWallet})
}
const getDepositPage = async(req,res)=>{
    const tickerSymbol = req.params.tickerSymbol
    const userWallet = await UserWallet.findOne({userID: req.user.id})
    const depositAddress = userWallet.depositAddress
    res.render('crypto-wallet/deposit', {tickerSymbol, depositAddress})
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
module.exports = { getBalance, getDepositPage, moralis_incoming_transaction }