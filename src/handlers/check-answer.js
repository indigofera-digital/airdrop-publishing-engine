const tableName = process.env.DYNAMODB_TABLE;
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const _ = require('lodash');

exports.checkAnswerHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`checkAnswer only accept POST method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    const payload = JSON.parse(event.body);
    // payload.airdropId
    // payload.questionId
    // payload.answerId

    var params = {
        TableName : tableName,
        Key: { id: payload.airdropId },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    const questions = _.keyBy(item.questions, 'id');
    const question = questions[payload.questionId];
    const correctAnswer = question.correctAnswerId == payload.answerId;
    
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere 
            "Access-Control-Allow-Methods": "POST" // Allow only POST request 
        },
        body: JSON.stringify(correctAnswer)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
