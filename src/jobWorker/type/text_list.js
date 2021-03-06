/**
 * text_list.js
 * type: text, message:`list`
 * 画像のカルーセルを表示
 */

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const list = async () => {
  let objs = await getImageObjects()

  let filenames = []
  for (let i = 0; (i < objs.Contents.length) && (i < 10); i++) {
    filenames.push(objs.Contents[i].Key)
  }

  let reply

  if (filenames.length > 0) {
    let columns = []

    for (let image of filenames) {
      let ary = image.split('.')
      if (ary[ary.length - 1] !== 'jpg') {
        continue
      }

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

    reply = {
      type: 'template',
      altText: 'this is a carousel template',
      template: {
        type: "image_carousel",
        columns
      }
    }
  }

  return reply || {}
}

const getImageObjects = async () => {
  let params = {
    Bucket: process.env.BUCKET,
    Prefix: "jpg/"
  }

  return await S3.listObjects(params).promise()
}

module.exports = list