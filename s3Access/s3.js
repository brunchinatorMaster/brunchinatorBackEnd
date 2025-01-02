const {
  s3Client,
  PutObjectCommand,
  s3Bucket
} = require('../aws/awsClients');

const uploadImageToS3 = async (userName, file) => {

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: userName,
    Body: Buffer.from(file.buffer),
  });

  let response;
  let success = false;
  let DBError;
  try {
    response = await s3Client.send(command);
    if(response?.$metadata?.httpStatusCode === 200) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  }
  return {
    success,
    DBError
  };

}

module.exports = {
  uploadImageToS3
}