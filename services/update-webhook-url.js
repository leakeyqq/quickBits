const Moralis = require('moralis').default
const config = require('config')

/**
 * This is to include ERC20 token transfers
 */
const runApp = async () => {
    await Moralis.start({
        apiKey: config.get('moralis.streams-api-key')
    })



    const response = await Moralis.Streams.update({
        id: config.get('moralis.stream-id'),
        webhookUrl: config.get('moralis.webhook-url'),
        description: "Changed webhook url"
    })

    console.log(response.toJSON)

}
runApp()