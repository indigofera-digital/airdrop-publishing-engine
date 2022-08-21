const tableName = process.env.DYNAMODB_TABLE;
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
