const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const image = async (id) => {
  let filename = id + '.jpg'
  let buffer = await getContent(id)

  let resp = await putImageObject(filename, buffer)
  console.log('HEY PUTIMAGE', resp)

  let url = 'https://' + process.env.BUCKET + '.s3.amazonaws.com/jpg/' + filename

  console.log('CHECK ', url)
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

module.exports = image