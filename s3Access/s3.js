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

const createFolder = async (folderName) => {
  const command = new PutObjectCommand({
    Bucket: REVIEW_IMAGES_BUCKET,
    Key: folderName,
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
};

/**
 * Uploads an array of image files to the specified S3 bucket folder.
 *
 * For each image, this function creates a PutObjectCommand using the image's buffer and original name,
 * then sends the command via s3Client. If the upload is successful (HTTP status code 200), the S3 key
 * (constructed as `${folderName}/${image.originalname}`) is added to the returned array. If an error
 * occurs during the upload process, it is thrown.
 *
 * @async
 * @param {Array<Object>} images - An array of image objects to be uploaded. Each image object should have:
 *   @property {Buffer} buffer - The binary data of the image.
 *   @property {string} originalname - The original filename of the image.
 * @param {string} folderName - The folder name used to construct the S3 object key.
 * @returns {Promise<string[]>} A promise that resolves to an array of S3 keys for the successfully uploaded images.
 * @throws Will throw an error if the upload process fails.
 */
const uploadReviewImages = async(images, folderName) => {
  const toReturn = [];
  for (const image of images) { 
    const command = new PutObjectCommand({
      Bucket: REVIEW_IMAGES_BUCKET,
      Key: `${folderName}/${image.originalname}`,
      Body: Buffer.from(image.buffer),
    });
    try {
      response = await s3Client.send(command);
      if(response?.$metadata?.httpStatusCode === 200) {
        toReturn.push(`${folderName}/${image.originalname}`);
      }
    } catch (error) {
      throw error;
    }
  };
  return toReturn;
}

module.exports = {
  uploadUserProfileImageToS3,
  getImagesCountForReview,
  createFolder,
  uploadReviewImages
}