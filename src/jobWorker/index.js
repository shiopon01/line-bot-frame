/**
 * index.js
 * 証明書を確認する
 */

const crypto = require('crypto')

const AWS = require('aws-sdk')
const SQS = new AWS.SQS()

const replyProcessing = require('./reply.js')

exports.handler = async (event, context, callback) => {
  // SQS records
  let records = event.Records

  for (let record of records) {
    // API Gateway Request Detail (httpStatus, headers, body ...)
    let mass = JSON.parse(record.body)

    let signature = crypto.createHmac('sha256', process.env.CHANNEL_SECRET).update(mass.body).digest('base64')
    let checkHeader = (mass.headers || {})['X-Line-Signature']

    if (signature === checkHeader) {
      let line = JSON.parse(mass.body)
      await replyProcessing(line)

    } else {
      console.log({"signatureError": mass})
    }

    // SQSのメッセージを削除
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
