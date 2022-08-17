const tableName = process.env.DYNAMODB_TABLE;
const systemWalletAddress = process.env.SYSTEM_WALLET_ADDRESS;
const systemWalletPrivate = process.env.SYSTEM_WALLET_PRIVATE;
const chainApiUrl = process.env.CHAIN_API_URL;
const chainApiKey = process.env.CHAIN_API_KEY;
const s3envBucket = process.env.S3_ENV_BUCKET;


const { v4: uuidv4 } = require('uuid');

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const deployContract = require('../utils/contract-utils').deploy;
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
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
    const contract = await deployContract(airdrop, chainApiUrl, systemWalletPrivate);
    airdrop['abi'] = contract.abi;
    airdrop['contractAddress'] = contract.contractAddress;

    // Add Airdrop to DynamoDB
    var params = {
        TableName : tableName,
        Item: airdrop
    };

    const result = await docClient.put(params).promise();
    console.info('Dynamo put result :', result);

    const response = {
        statusCode: 200,
        body: JSON.stringify(airdrop)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
