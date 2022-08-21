const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const settings = require('../settings');
const Web3 = require('web3');
const fs = require('fs-extra');

// const deployContract = require('../utils/contract-utils').deploy;

exports.sendRewardHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`createAirdrop only accept POST method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    const payload = JSON.parse(event.body);
    // payload.id
    // payload.tokenAddress
    // payload.receiver
    // payload.amount

    const web3 = new Web3(settings.chainRPC);
    const contractJSONInterface = await fs.readJson(settings.quizFactoryJSONPath);
    const factoryContract = new web3.eth.Contract(contractJSONInterface.abi, settings.quizFactoryAddress);

    const sendRewardTx = {
        to: settings.quizFactoryAddress,
        data: factoryContract.methods.sendQuizReward(payload.id, payload.tokenAddress, payload.receiver, payload.amount).encodeABI(),
        // gas: await web3.eth.getGasPrice()
        gas: '8000000'
    };

    const transaction = await web3.eth.accounts.signTransaction(sendRewardTx, settings.walletPrivate);
    const transactionResponse = await web3.eth.sendSignedTransaction(transaction.rawTransaction);

    console.log("Sending Airdrop reward: " + payload.id + " to: " + payload.receiver + " with amount: " + payload.amount);

    const response = {
        statusCode: 200,
        body: JSON.stringify(
            {
                transactionHash: transactionResponse.transactionHash,
            }
        )
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
