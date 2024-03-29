const { v4: uuidv4 } = require('uuid');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const settings = require('../settings');
const Web3 = require('web3');
const tableName = process.env.DYNAMODB_TABLE;
const fs = require('fs-extra');
const { publishCampaign } = require("../services/campaign-publishing.service.js")

// const deployContract = require('../utils/contract-utils').deploy;

exports.createAirdropHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`createAirdrop only accept POST method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const airdrop = JSON.parse(event.body);
    // const id = body.id;
    // const name = body.name;
    // const type = body.type;
    // const chain = body.chain;
    // const token = body.token;
    // const amount = body.amount;
    // const reward = body.reward;
    // const questions = body.questions;
    // const answers = body.answers;

    const airdropId = uuidv4();
    airdrop['id'] = airdropId;

    // Deploy Airdrop Smart Contract
    // const contract = await deployContract(airdrop, chainApiUrl, systemWalletPrivate);
    // airdrop['abi'] = contract.abi;
    // airdrop['contractAddress'] = contract.contractAddress;

    console.log(settings);

    const web3 = new Web3(settings.chainRPC);
    const contractJSONInterface = await fs.readJson(settings.quizFactoryJSONPath);
    const factoryContract = new web3.eth.Contract(contractJSONInterface.abi, settings.quizFactoryAddress);

    const addAirdropTx = {
        // from: from,
        to: settings.quizFactoryAddress,
        data: factoryContract.methods.createQuiz(airdropId).encodeABI(),
        // gas: await web3.eth.getGasPrice()
        gas: '8000000'

    };

    const transaction = await web3.eth.accounts.signTransaction(addAirdropTx, settings.walletPrivate);
    const transactionReceipt = await web3.eth.sendSignedTransaction(transaction.rawTransaction);
    console.log("Create Airdrop Transaction Receipt: ", transactionReceipt);

    // wait transaction and get address
    const address = await factoryContract.methods.quizzes(airdropId).call();
    console.log("Created Airdrop: " + airdropId + " at address: " + address);

    airdrop['address'] = address;

    // Publish quiz game
    console.log("Publishing quiz game: " + airdropId);
    try {
        await publishCampaign(airdrop.id, airdrop.questions)
        airdrop['campaignUrl'] = `http://airdrop-campaigns.s3-website-eu-west-1.amazonaws.com/${airdrop.id}/`
    } catch (err) {
        console.log("Quiz not published")
    }
    console.log("Log after publishing to s3. Putting to DynamoDB");

    // Add Airdrop to DynamoDB
    var params = {
        TableName: tableName,
        Item: airdrop
    };
    const result = await docClient.put(params).promise();
    console.info('Dynamo put result :', result);

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere 
            "Access-Control-Allow-Methods": "POST" // Allow only POST request 
        },
        body: JSON.stringify(airdrop)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
