/**
 * image_put.js
 * type: image
 * 送信された画像をそのまま返す
 */

const AWS = require('aws-sdk')
const S3 = new AWS.S3()
const LINE = require('@line/bot-sdk')
const CLIENT = new LINE.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
})

const image = async (id) => {
  let filename = id + '.jpg'
  let buffer = await getContent(id)

  let resp = await putImageObject(filename, buffer)
  let url = 'https://' + process.env.BUCKET + '.s3.amazonaws.com/jpg/' + filename

  return {
    type: 'image',
    originalContentUrl: url,
    previewImageUrl: url
  }
}

const putImageObject = async (filename, buffer) => {
  let params = {
    Bucket: process.env.BUCKET,
    Key: 'jpg/' + filename,
    Body: buffer
  }

  return await S3.putObject(params).promise()
}

const getContent = (messageId) => {
  return new Promise((resolve, reject) => {
    CLIENT.getMessageContent(messageId)
    .then((stream) => {
      var content = []

      stream
      .on('data', (chunk) => {
        // console.log({'chunk': chunk})
        content.push(new Buffer(chunk))
      })
      .on('error', (err) => {
          reject(err)
      })
      .on('end', function(){
        // console.log({'getContentEnd': content})
        resolve(Buffer.concat(content))
      })
    })
  })
}

module.exports = image