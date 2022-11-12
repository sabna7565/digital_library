const AWS = require('aws-sdk');
require('dotenv').config();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

let bucketName = process.env.BUCKET_NAME;
let region = process.env.BUCKET_REGION;
let accessKeyId = process.env.ACCESS_KEY;
let secretAccessKey = process.env.SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region,
});

const s3 = new AWS.S3();

async function uploadFile(file, name) {
  const uploadParams = {
    Bucket: bucketName,
    Body: file,
    Key: name,
  };

  return new Promise(async (res, rej) => {
    try {
      let data = await s3.upload(uploadParams).promise();
      res(data);
    } catch (error) {
      rej(error);
    }
  });
}

function getFileStream(fileKey) {
  try {
    const downloadParams = {
      Key: fileKey,
      Bucket: bucketName,
    };

    return s3.getObject(downloadParams).createReadStream();
  } catch(err) {
    return err
  }
}

function deleteFile(fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  return new Promise (async (res,rej) => {
   try {

       await s3.headObject(params).promise();
       try {
         await s3.deleteObject(params).promise();
         res("File deleted Successfully")
       } catch (err) {
         res("ERROR in file Deleting : " + JSON.stringify(err))
       }
       
     } catch (err) {
       res( "File not Found ERROR : " + err.code )
     }
  })
}

 async function generateUploadURL(key) {
  const params = ({
    Bucket: bucketName,
    Key: key,
    Expires: parseInt(604800)
  })

  const uploadURL = await s3.getSignedUrlPromise('getObject', params,)
  return uploadURL
}

module.exports = {
  uploadFile,
  getFileStream,
  deleteFile,
  generateUploadURL
};
