const crypto = require('crypto')

const AWS = require('aws-sdk')
const SQS = new AWS.SQS()
const S3 = new AWS.S3()

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

        let reply = {}

        if (event.message.type === 'text') {
          reply.type = 'text'
          reply.text = event.message.text
        }

        if (event.message.type === 'image') {
          let filename = event.message.id + '.jpg'

          let buffer = await getContent(event.message.id)
          let putParams = {
            Bucket: process.env.BUCKET,
            Key: 'jpg/' + filename,
            Body: buffer
          }

          let resp = await S3.putObject(putParams).promise()
          .catch((err) => {
            console.log({"S3Error": err})
          })

          let url = 'https://' + process.env.BUCKET + '.s3.amazonaws.com/jpg/' + filename

          reply.type = 'image'
          reply.originalContentUrl = url
          reply.previewImageUrl = url
        }

        // 送信処理

        if (reply.hasOwnProperty('type')) {
          await CLIENT.replyMessage(event.replyToken, reply)
          .catch((err) => {
            console.log({"replyMessageError": err, reply})
          })
        }
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

const getContent = (messageId) => {
  return new Promise((resolve, reject) => {
    CLIENT.getMessageContent(messageId)
    .then((stream) => {
      var content = []

      stream
      .on('data', (chunk) => {
        console.log({'chunk': chunk})
        content.push(new Buffer(chunk))
      })
      .on('error', (err) => {
          reject(err)
      })
      .on('end', function(){
        console.log({'getContentEnd': content})
        resolve(Buffer.concat(content))
      })
    })
  })
}