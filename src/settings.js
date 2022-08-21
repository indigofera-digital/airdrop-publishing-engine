const path = require('path');

const tableName = process.env.DYNAMODB_TABLE;
const systemWalletPrivate = process.env.SYSTEM_WALLET_PRIVATE;
const contractAdress = process.env.QUIZ_FACTORY_ADDRESS;
const chainApiUrl = process.env.CHAIN_API_URL;

module.exports = {
    quizFactoryAddress: contractAdress,
    quizFactoryJSONPath: path.join(__dirname, "../contracts/", "QuizFactory.json"),
    dynamoTable: tableName,
    walletPrivate: systemWalletPrivate,
    chainRPC: chainApiUrl
}
