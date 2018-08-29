const crypto = require('crypto')

const AWS = require('aws-sdk')
const SQS = new AWS.SQS()

const LINE = require('@line/bot-sdk')
const CLIENT = new LINE.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
})

exports.handler = async (event, context, callback) => {
  // SQSのレコード群
  let records = event.Records

  for (let record of records) {
    // LINE Bot Serverに渡されたAPIリクエストの詳細
    let mass = JSON.parse(record.body)

    let signature = crypto.createHmac('sha256', process.env.CHANNEL_SECRET).update(mass.body).digest('base64')
    let checkHeader = (mass.headers || {})['X-Line-Signature']

    if (signature === checkHeader) {
      // mass.body はLINEのイベントの本体（LINEからの1リクエストの内容）
      let body = JSON.parse(mass.body)

      for (let event of body.events) {
        // 各メッセージに施す処理

        console.log({"event": event})
        let text = event.message.text

        // 送信処理

        const reply = {
          'type': 'text',
          'text': text
        }

        await CLIENT.replyMessage(event.replyToken, reply)
        .catch((err) => {
          console.log({"replyMessageError": err, reply})
        })
      }
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