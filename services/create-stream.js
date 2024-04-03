require('dotenv').config()
const Moralis = require('moralis').default
const config = require('config')

const stream_description = 'stream data from BNB testnet for QuickBits'
const stream_tag = 'QBitstest101'
const blockchain_network = [config.get('moralis.bnb-testnet-id')]

const runApp = async () => {
    await Moralis.start({
        apiKey: process.env.MORALIS_STREAMS_API_KEY
    })

    const response = await Moralis.Streams.add({
        webhookUrl: process.env.MORALIS_WEBHOOK_URL,
        description: stream_description,
        tag: stream_tag,
        chains: blockchain_network ,
        includeNativeTxs: true
    })

    console.log(response.toJSON())

}
runApp()