const AWS = require('aws-sdk')
const SQS = new AWS.SQS()

exports.handler = (event, context) => {
  console.log(event.body)
  let body = JSON.parse(event.body)

  // Connect Test
  if (body.events[0].replyToken === '00000000000000000000000000000000') {
    let resp = {
      statusCode: 200
    }
    context.succeed(resp)
    return
  }

  let params = {
    MessageBody: JSON.stringify(event),
    QueueUrl: process.env.SQS_URL,
    DelaySeconds: 0,
  }

  SQS.sendMessage(params).promise()
  .then((res) => {
    let resp = {
      statusCode: 200
    }
    context.succeed(resp)
  })
  .catch((err) => {
    context.fail(err)
  })
}