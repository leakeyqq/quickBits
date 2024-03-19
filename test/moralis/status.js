const axios = require('axios');

/**
 * Transactions with problems 
 * 0x843ff05befdbc091d7f5c3eeb04f61cff556296695526afa5c2e4bb7542ecae5
 */
const txHash = '0xd12f19ff97bd77b65b001a03870adcc03e45f8fd5f109120cd5cd08b382dc98f'

let contractExecution = {
  method: 'get',
  maxBodyLength: Infinity,
  url: `https://api.bscscan.com/api?module=transaction&action=getstatus&txhash=${txHash}&apikey=TVZE1K3SU6BNH9G6GJCE83QX4JVB3NA5JA`,
  headers: { }
}
let receiptStatus= {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=TVZE1K3SU6BNH9G6GJCE83QX4JVB3NA5JA`,
    headers: { }
  }


checkContractExecution(contractExecution)
checkReceiptStatus(receiptStatus)

async function checkContractExecution(contractExecution){
    const transactionDetails = await axios.request(contractExecution)
    console.log('Contract execution status: ', transactionDetails.data)
}

async function checkReceiptStatus(receiptStatus){
    const transactionDetails = await axios.request(receiptStatus)
    console.log('Transaction Receipt Status: ',transactionDetails.data.result.status)
}