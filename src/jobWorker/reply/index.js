const axios = require('axios')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const LINE = require('@line/bot-sdk')
const CLIENT = new LINE.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
})

const reply = async (lineMessage) => {

  for (let event of lineMessage.events) {
    console.log({"event": event})

    let reply = {}

    switch (event.message.type) {
      case 'text':

        if (event.message.text === 'list') {
          let params = {
            Bucket: process.env.BUCKET,
            Prefix: "jpg/"
          }

          let objs = await S3.listObjects(params).promise()
          .catch((err) => {
            console.log(err)
          })

          let filenames = []
          for (let i = 0; (i < objs.Contents.length) && (i < 10); i++) {
            filenames.push(objs.Contents[i].Key)
          }

          console.log('fn ', filenames)

          if (filenames.length > 0) {
            let columns = []

            for (let image of filenames) {
              let url = 'https://' + process.env.BUCKET + '.s3.amazonaws.com/' + image

              columns.push({
                imageUrl: url,
                action: {
                  type: "message",
                  label: "Yes",
                  text: "Yes"
                }
              })
            }

            reply.type = 'template'
            reply.altText = 'this is a carousel template',
            reply.template = {
              type: "image_carousel",
              columns
            }

            console.log({"calsel": reply})
            break
          }
        }

        reply.type = 'text'
        reply.text = event.message.text
        break

      case 'image':
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
        break

    //   case 'video':
    //     // not checked to move

    //     let filename = event.message.id + '.mp4'

    //     let buffer = await getContent(event.message.id)
    //     let putParams = {
    //       Bucket: process.env.BUCKET,
    //       Key: 'mp4/' + filename,
    //       Body: buffer
    //     }

    //     let resp = await S3.putObject(putParams).promise()
    //     .catch((err) => {
    //       console.log({"S3Error": err})
    //     })

    //     let url = 'https://' + process.env.BUCKET + '.s3.amazonaws.com/mp4/' + filename

    //     reply.type = 'video'
    //     reply.originalContentUrl = url
    //     reply.previewImageUrl = url
    //     break
    }

    // 送信処理

    console.log({"reply": JSON.stringify(reply)})

    if (reply.hasOwnProperty('type')) {
      await CLIENT.replyMessage(event.replyToken, reply)
      .then((res) => {
        console.log({"replyMessageOK": res})
      })
      .catch((err) => {
        console.log({"replyMessageError": err})
      })
    }
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

module.exports = reply