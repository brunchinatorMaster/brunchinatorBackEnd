const {
  s3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  USER_PROFILE_IMAGES_BUCKET,
  REVIEW_IMAGES_BUCKET
} = require('../aws/awsClients');

/**
 * Uploads a user's profile image to an S3 bucket.
 *
 * This asynchronous function creates and sends a PutObjectCommand to upload the file buffer to the S3 bucket 
 * designated for user profile images. The S3 object key is set to the provided userName.
 * If the S3 response indicates success with an HTTP status code of 200, the function returns success as true.
 * Any error encountered during the upload is captured in the S3Error field.
 *
 * @async
 * @param {string} userName - The username used as the key for storing the profile image in the S3 bucket.
 * @param {Object} file - The file object containing the image to upload.
 *   Expected to have a `buffer` property with the file's binary data.
 * @returns {Promise<{success: boolean, S3Error?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the upload was successful.
 *   - S3Error {Error} (optional): The error encountered during the upload, if any.
 */
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

/**
 * Retrieves the count of images stored in S3 for a specific review.
 *
 * This asynchronous function uses the AWS SDK's ListObjectsV2Command to list objects in the S3 bucket
 * designated for review images. It filters the objects using a prefix that matches the reviewId followed by a slash.
 * The command is configured to return at most one key (MaxKeys: 1) so that the returned KeyCount represents the number of images.
 * If the S3 response indicates success (HTTP status code 200), the function sets the success flag to true
 * and extracts the number of images from the response's KeyCount property.
 * Any error encountered during the operation is captured in the S3Error field.
 *
 * @async
 * @param {string} reviewId - The unique identifier for the review whose images are to be counted.
 * @returns {Promise<{success: boolean, numberOfImages: number, S3Error?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the operation was successful.
 *   - numberOfImages {number}: The number of images associated with the review (as reported by S3).
 *   - S3Error {Error} (optional): The error encountered during the S3 operation, if any.
 */
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

/**
 * Creates a folder in the review images S3 bucket.
 *
 * This asynchronous function uses the AWS SDK's PutObjectCommand to create a folder (object)
 * in the designated S3 bucket (REVIEW_IMAGES_BUCKET) with the specified folderName as the key.
 * If the S3 operation completes successfully with an HTTP status code of 200, the success flag is set to true.
 * Any error encountered during the operation is captured in the S3Error field.
 *
 * @async
 * @param {string} folderName - The name of the folder to create in the S3 bucket.
 * @returns {Promise<{success: boolean, S3Error?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the folder was created successfully.
 *   - S3Error {Error} (optional): The error encountered during the operation, if any.
 */
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