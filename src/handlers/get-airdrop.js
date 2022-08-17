const tableName = process.env.DYNAMODB_TABLE;
const systemWalletAddress = process.env.SYSTEM_WALLET_ADDRESS;
const systemWalletPrivate = process.env.SYSTEM_WALLET_PRIVATE;
const chainApiUrl = process.env.CHAIN_API_URL;
const chainApiKey = process.env.CHAIN_API_KEY;
const s3envBucket = process.env.S3_ENV_BUCKET;


// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.getAirdropHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    console.info('received:', event);

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
    const id = event.pathParameters.id;

    var params = {
        TableName : tableName,
        Key: { id: id },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(item)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
