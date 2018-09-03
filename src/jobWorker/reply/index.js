// const axios = require('axios')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const LINE = require('@line/bot-sdk')
const CLIENT = new LINE.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
})

const listfunc = require('./text_list.js')
const imagefunc = require('./image_put.js')

const reply = async (lineMessage) => {

  for (let event of lineMessage.events) {
    console.log({"event": event})

    let reply
    switch (event.message.type) {
      case 'text':
        console.log('text route: text is ', event.message.text)

        switch (event.message.text) {
          case 'list':
            reply = await listfunc()
            console.log("LOG: " + "listfunc end ", reply)
            break

          default:
            reply = {
              type: 'text',
              text: event.message.text
            }
        }
        break

      case 'image':
        console.log('image route: image-id is ', event.message.id)

        reply = await imagefunc(event.message.id)
        console.log("LOG: " + "imagefunc end ", reply)
        break

      default:
        console.log('default route:')
    }

    // 送信処理
    console.log("LOG: " + "END OF SWITCH ", reply)
    // console.log({"reply": JSON.stringify(reply)})

    if (reply.hasOwnProperty('type')) {
      CLIENT.replyMessage(event.replyToken, reply)
      .then((res) => {
        console.log({"replyMessageOK": res})
      })
      .catch((err) => {
        console.log({"replyMessageError": err})
      })
    }
  }
}

module.exports = reply