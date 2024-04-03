require('dotenv').config()
const Moralis = require('moralis').default
const config = require('config')

/**
 * This is to include ERC20 token transfers
 */
const runApp = async () => {
    await Moralis.start({
        apiKey: process.env.MORALIS_STREAMS_API_KEY
    })



    const response = await Moralis.Streams.update({
        id: process.env.MORALIS_STREAM_ID,
        webhookUrl: process.env.MORALIS_WEBHOOK_URL,
        description: "Changed webhook url"
    })

    console.log(response.toJSON)

}
runApp()