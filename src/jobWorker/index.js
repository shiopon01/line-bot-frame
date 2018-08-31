const crypto = require('crypto')

const AWS = require('aws-sdk')
const SQS = new AWS.SQS()
const reply = require('./reply')

exports.handler = async (event, context, callback) => {

  // SQS records
  let records = event.Records

  for (let record of records) {
    // LINE Bot Serverに渡されたAPIリクエストの詳細
    let mass = JSON.parse(record.body)

    let signature = crypto.createHmac('sha256', process.env.CHANNEL_SECRET).update(mass.body).digest('base64')
    let checkHeader = (mass.headers || {})['X-Line-Signature']

    if (signature === checkHeader) {
      let line = JSON.parse(mass.body)
      reply(line)

    } else {
      console.log({"signatureError": mass})
    }

    // 以下、SQSのメッセージを削除する処理
    let params = {
      QueueUrl: process.env.SQS_URL,
      ReceiptHandle: record.receiptHandle
    }

    await SQS.deleteMessage(params).promise()
    .catch((err) => {
      console.log({'deleteMessageError': err})
    })
  }
}
