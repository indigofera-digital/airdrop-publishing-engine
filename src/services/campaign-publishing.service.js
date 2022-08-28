const AWS = require("aws-sdk");
const s3 = new AWS.S3();

function publishCampaign(id, questions) {

    syncDirs(id, "airdrop-campaigns", "airdrop-campaign-template")
        .then(() => getJSONFileContent("airdrop-campaigns", `${id}/config.prod.json`))
        .then(data => ({ ...data, campaignId: id, quizSettings: { ...data.quizSettings, questions } }))
        .then(data => createJSONFile("airdrop-campaigns", `${id}/config.prod.json`, data))
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })

}

function syncDirs(campaignId, destinationBucket, sourceBucket) {

    return s3.listObjects({ Bucket: sourceBucket, Prefix: "template" }).promise()
        .then(data => {

            return data.Contents.map(file => {
                var params = {
                    Bucket: destinationBucket,
                    CopySource: sourceBucket + '/' + file.Key,
                    Key: file.Key.replace("template", campaignId)
                };
                return s3.copyObject(params).promise()
            })

        })

}

function getJSONFileContent(bucketId, filePath) {
    params = {
        Bucket: bucketId,
        Key: filePath
    }

    return s3.getObject(params).promise().then(data => JSON.parse(data.Body.toString()))

}

function createJSONFile(bucketId, filePath, jsonObject) {

    var params = {
        Body: JSON.stringify(jsonObject),
        Bucket: bucketId,
        Key: filePath,
    }
    return s3.putObject(params).promise()

}

module.exports = {
    publishCampaign
}

