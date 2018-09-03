/**
 * reply.js
 * 返信処理のメイン
 * メッセージのタイプで処理を切り替える
 */

const LINE = require('@line/bot-sdk')
const CLIENT = new LINE.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
})

const type = require('./type')

const reply = async (lineMessage) => {
  for (let event of lineMessage.events) {
    // console.log({"event": event})

    let reply
    switch (event.message.type) {
      case 'text':

        switch (event.message.text) {
          case 'list':
            reply = await type.text.list()
            break

          default:
            reply = {
              type: 'text',
              text: event.message.text
            }
        }
        break

      case 'image':

        reply = await type.image.put(event.message.id)
        break

      default:
        // console.log('default route:')

        reply = {
          type: 'text',
          text: 'IDK this message type ...'
        }
    }

    // 送信
    console.log(`LOG_${__filename}: `, {reply})

    if (reply.hasOwnProperty('type')) {
      await CLIENT.replyMessage(event.replyToken, reply)
      .catch((err) => {
        console.log({"replyMessageError": err})
      })
    }
  }
}

module.exports = reply