const Moralis = require('moralis').default
const config = require('config')

/**
 * This is to include ERC20 token transfers
 */
const runApp = async () => {
    await Moralis.start({
        apiKey: config.get('moralis.streams-api-key')
    })

    const topic = "Transfer(address,address,uint256)"

    const response = await Moralis.Streams.update({
        id: config.get('moralis.stream-id'),
        abi: config.get('moralis.erc20-transfer-abi'),
        includeContractLogs: true,
        topic0: topic,
        description: "Listen to erc20 transfers"
    })

    console.log(response.toJSON)

}
runApp()