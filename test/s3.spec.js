const { assert } = require('chai');
const { mockS3SuccssResponse, mockGenericS3Error, mockListObjectsVSCommandResponse } = require('../test/mockS3Response');
const { s3Client, PutObjectCommand, ListObjectsV2Command } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const s3ClientMock = mockClient(s3Client);
const { uploadUserProfileImageToS3, getImagesCountForReview } = require('../s3Access/s3');

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
});
