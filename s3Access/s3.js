const {
  s3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  USER_PROFILE_IMAGES_BUCKET,
  REVIEW_IMAGES_BUCKET
} = require('../aws/awsClients');

const uploadUserProfileImageToS3 = async (userName, file) => {

  const command = new PutObjectCommand({
    Bucket: USER_PROFILE_IMAGES_BUCKET,
    Key: userName,
    Body: Buffer.from(file.buffer),
  });

  let response;
  let success = false;
  let S3Error;
  try {
    response = await s3Client.send(command);
    if(response?.$metadata?.httpStatusCode === 200) {
      success = true;
    }
  } catch (error) {
    S3Error = error;
  }
  return {
    success,
    S3Error
  };
}

const getImagesCountForReview = async (reviewId) => {
  const command = new ListObjectsV2Command({
    Bucket: REVIEW_IMAGES_BUCKET,
    Prefix: `${reviewId}/`,
    MaxKeys: 1,
  });

  let response;
  let success = false;
  let numberOfImages = 0;
  let S3Error;
  try {
    response = await s3Client.send(command);
    if (response?.$metadata?.httpStatusCode === 200) {
      success = true;
      numberOfImages = response?.KeyCount ?? 0;
    }
  } catch (error) {
    S3Error = error;
  }
  return {
    success,
    numberOfImages,
    S3Error
  };
}

module.exports = {
  uploadUserProfileImageToS3,
  getImagesCountForReview
}