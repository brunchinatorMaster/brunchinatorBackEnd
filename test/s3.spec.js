const { assert } = require('chai');
const { mockS3SuccssResponse, mockGenericS3Error, mockListObjectsVSCommandResponse, mockS3CreateFolderResponse } = require('../test/mockS3Response');
const { s3Client, PutObjectCommand, ListObjectsV2Command } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const s3ClientMock = mockClient(s3Client);
const { uploadUserProfileImageToS3, getImagesCountForReview, createFolder, uploadReviewImages } = require('../s3Access/s3');

describe('s3.js', () => {
  beforeEach(() => {
    s3ClientMock.reset();
  });
  describe('uploadUserProfileImageToS3', () => {
    it('returns success upon succssful upload', async () => {
      s3ClientMock.on(PutObjectCommand).resolves(mockS3SuccssResponse);
      const file = {
        buffer: 'foo'
      }

      const response = await uploadUserProfileImageToS3('username', file);

      assert.deepEqual(response, {
        success: true,
        S3Error: undefined,
      });
    });

    it('returns error if s3 throws error', async () => {
      s3ClientMock.on(PutObjectCommand).rejects(mockGenericS3Error);
      const file = {
        buffer: 'foo'
      }

      const response = await uploadUserProfileImageToS3('username', file);

      assert.deepEqual(response, {
        success: false,
        S3Error: mockGenericS3Error,
      });
    });
  });

  describe('getImagesCountForReview', () => {
    it('returns count', async () => {
      s3ClientMock.on(ListObjectsV2Command).resolves(mockListObjectsVSCommandResponse);
      
      const response = await getImagesCountForReview('reviewId');

      assert.deepEqual(response, {
        success: true,
        numberOfImages: 1,
        S3Error: undefined,
      });
    });

    it('returns error if s3 throws error', async () => {
      s3ClientMock.on(ListObjectsV2Command).rejects(mockGenericS3Error);
      
      const response = await getImagesCountForReview('reviewId');

      assert.deepEqual(response, {
        success: false,
        numberOfImages: 0,
        S3Error: mockGenericS3Error,
      });
    });
  });

  describe('createFolder', () => {
    it('creates folder', async () => {
      s3ClientMock.on(PutObjectCommand).resolves(mockS3CreateFolderResponse);
      
      const response = await createFolder('reviewId');

      assert.deepEqual(response, {
        success: true,
        S3Error: undefined,
      });
    });

    it('returns error if s3 throws error', async () => {
      s3ClientMock.on(PutObjectCommand).rejects(mockGenericS3Error);
      
      const response = await createFolder('reviewId');

      assert.deepEqual(response, {
        success: false,
        S3Error: mockGenericS3Error,
      });
    });
  });

  describe('uploadReviewImages', () => {
    it('retursn an array of S3 keys when all image uploads succeed', async () => {
      const images = [
        { originalname: 'img1.jpg', buffer: Buffer.from('data1') },
        { originalname: 'img2.png', buffer: Buffer.from('data2') }
      ];
      const folderName = 'review123';

      // Simulate success for each image upload
      s3ClientMock.on(PutObjectCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

      const result = await uploadReviewImages(images, folderName);

      const expected = [
        `${folderName}/img1.jpg`,
        `${folderName}/img2.png`
      ];
      assert.deepEqual(result, expected);
    });

    it('throws an error if any image upload fails', async () => {
      const images = [
        { originalname: 'img1.jpg', buffer: Buffer.from('data1') },
        { originalname: 'img2.png', buffer: Buffer.from('data2') }
      ];
      const folderName = 'review123';

      // First image upload succeeds, second fails.
      s3ClientMock.on(PutObjectCommand)
        .resolvesOnce({
          $metadata: {
            httpStatusCode: 200
          }
        })
        .rejectsOnce(mockGenericS3Error);

      try {
        await uploadReviewImages(images, folderName);
        assert.fail('Expected error to be thrown');
      } catch (error) {
        assert.equal(error, mockGenericS3Error);
      }
    });
  });
});
