const { expect, assert } = require('chai');
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();
const mockReviews = require('../mockDataBase/reviews');

const {
  docClient,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  PutCommand,
  TransactWriteCommand,
  s3Client,
  ListObjectsV2Command,
  PutObjectCommand
} = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);
const s3ClientMock = mockClient(s3Client);
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { deepCopy } = require('../utils/utils');
const mockPlaces = require('../mockDataBase/places');
const { mockListObjectsVSCommandResponse, mockGenericS3Error } = require('./mockS3Response');

describe('reviewsHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
    s3ClientMock.reset();
  });

  describe('getReviews', () => {
    it('returns reviews found by dynamo', async () => { 
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: reviews
      });

      const response = await reviewsHandler.getReviews();
      assert.deepEqual(response, {
        success: true,
        reviews: reviews
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviews();

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getReviewByReviewId', () => {
    it('returns BadSchemaResponse is reviewId is invalid', async () => {
      const response = await reviewsHandler.getReviewByReviewId(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"reviewId" must be a string');
    });

    it('returns review found by dynamo', async () => {
      const review = deepCopy(mockReviews[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [review]
      });
  
      const response = await reviewsHandler.getReviewByReviewId(review.reviewId);

      assert.deepEqual(response, {
        success: true,
        reviewExists: true,
        review,
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewByReviewId('123');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getReviewsByPlaceId', () => {
    it('returns BadSchemaResponse is placeId is invalid', async () => {
      const response = await reviewsHandler.getReviewsByPlaceId(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeId" must be a string');
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[1], reviews[2]]
      });
  
      const response = await reviewsHandler.getReviewsByPlaceId('place2');

      assert.deepEqual(response, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[1], reviews[2]],
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewsByPlaceId('123');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getImagesCountForReview', () => {
    it('returns BadSchemaResponse is reviewId is invalid', async () => {
      const response = await reviewsHandler.getImagesCountForReview(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"reviewId" must be a string');
    });

    it('returns count found by s3', async () => {
      s3ClientMock.on(ListObjectsV2Command).resolves(mockListObjectsVSCommandResponse);
  
      const response = await reviewsHandler.getImagesCountForReview('reviewId');

      assert.deepEqual(response, {
        success: true,
        numberOfImages: 1,
      });
    });

    it('returns AWSErrorResponse if s3 throws error', async () => {
      s3ClientMock.on(ListObjectsV2Command).rejects(mockGenericS3Error);

      const response = await reviewsHandler.getImagesCountForReview('reviewId');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericS3Error.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericS3Error.message);
    });
  });

  describe('getReviewsByUserName', () => {
    it('returns BadSchemaResponse is userName is invalid', async () => {
      const response = await reviewsHandler.getReviewsByUserName(123);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[0], reviews[1]]
      });
  
      const response = await reviewsHandler.getReviewsByUserName('geo');

      assert.deepEqual(response, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[0], reviews[1]],
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.getReviewsByUserName('123');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('deleteReviewByReviewId', () => {
    describe('when deleting a review for a place that has only 1 review', () => {
      it('deletes correct review, deletes place, and returns success:true', async () => {
        // call for getReviewByReviewId
        const review = deepCopy(mockReviews[0]);
        ddbMock.on(QueryCommand, {
          TableName: 'Reviews',
          ExpressionAttributeValues: {
            ':reviewId': review.reviewId,
          },
          KeyConditionExpression: 'reviewId = :reviewId',
          ConsistentRead: true,
        }).resolves({
          Items: [review]
        });

        // call for getPlaceByPlaceId
        const place = deepCopy(mockPlaces[0])
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId,
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });

        // call for TransactWriteCommand
      ddbMock.on(TransactWriteCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

        const response = await reviewsHandler.deleteReviewByReviewId(review.reviewId);
        assert.deepEqual(response, { 
          success: true,
          DBError: undefined,
         })
      });
    });
    
    describe('when deleteing a review for a place that has more than 1 review', () => {
      it('deletes correct review, updates place, and returns success:true', async () => {
        // call for getReviewByReviewId
      const review = deepCopy(mockReviews[1]);
      ddbMock.on(QueryCommand, {
        TableName: 'Reviews',
        ExpressionAttributeValues: {
          ':reviewId': review.reviewId,
        },
        KeyConditionExpression: 'reviewId = :reviewId',
        ConsistentRead: true,
      }).resolves({
        Items: [review]
      });

      // call for getPlaceByPlaceId
      const place = deepCopy(mockPlaces[1])
      ddbMock.on(QueryCommand, {
        TableName: 'Places',
        ExpressionAttributeValues: {
          ':placeId': review.placeId,
        },
        KeyConditionExpression: 'placeId = :placeId',
        ConsistentRead: true,
      }).resolves({
        Items: [place]
      });

      // call for TransactWriteCommand
      ddbMock.on(TransactWriteCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

      const response = await reviewsHandler.deleteReviewByReviewId(review.reviewId);
      assert.deepEqual(response, { 
        success: true,
        DBError: undefined
       })
      });
    });
  });

  describe('addReview', () => {
    describe('when adding a review for a new place', () => {
      it('attaches image URLs when image files are provided and returns success message if transaction write command succeeds', async () => {
        // Prepare a review without a reviewId so that a new place is created.
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;

        // Create a fake image file array (simulate file objects)
        const fakeImage1 = {
          originalname: 'image1.jpg',
          buffer: Buffer.from('fake-image-data-1')
        };
        const fakeImage2 = {
          originalname: 'image2.png',
          buffer: Buffer.from('fake-image-data-2')
        };
        const imageFiles = [fakeImage1, fakeImage2];

        // Simulate that the place does not exist (new place)
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: []
        });

        // For the transaction call to add the new place and review, simulate success.
        ddbMock.on(TransactWriteCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Simulate S3 upload responses for each image file.
        // For each PutObjectCommand, return a success response.
        s3ClientMock.on(PutObjectCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Call addReview with imageFiles
        const response = await reviewsHandler.addReview(review, imageFiles);

        // Verify that the transaction succeeded.
        assert.deepEqual(response, {
          success: true,
          DBError: undefined
        });

        // Verify that uploadReviewImages was called for each image file.
        // Since addReview calls this.handleImagesFiles, which in turn calls uploadReviewImages,
        // we expect two PutObjectCommand calls to have been made.
        const putCommands = s3ClientMock.commandCalls(PutObjectCommand);
        assert.equal(putCommands.length, imageFiles.length);

        // Check that the command input for each call has a Key in the format "<reviewId>/<originalname>"
        // We cannot know the generated reviewId, but we can assert that the Key includes a slash and the filename.
        putCommands.forEach((putCommandCall, index) => {
          const input = putCommandCall.args[0].input;
          // Check that the key contains a slash and the original name of the image.
          assert.isTrue(input.Key.includes('/'));
          assert.isTrue(input.Key.endsWith(imageFiles[index].originalname));
        });
      });

      it('does not attempt to upload images if no image files are provided and returns success message if transaction write command succeeds', async () => {
        // Prepare a review without image files.
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;

        // Simulate that the place does not exist (new place)
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: []
        });

        // For the transaction call to add the new place and review, simulate success.
        ddbMock.on(TransactWriteCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Call addReview without imageFiles
        const response = await reviewsHandler.addReview(review, []);

        // Verify that the transaction succeeded.
        assert.deepEqual(response, {
          success: true,
          DBError: undefined
        });

        // Verify that no PutObjectCommand was called (i.e. no image uploads occurred)
        const putCommands = s3ClientMock.commandCalls(PutObjectCommand);
        assert.equal(putCommands.length, 0);
      });

      it('returns AWSErrorResponse if transaction write command returns error', async () => {
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;

        // call for getPlaceByPlaceId
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId,
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: []
        });
    
          // call for TransactWriteCommand
          ddbMock.on(TransactWriteCommand).rejects(mockGenericDynamoError);
    
          const response = await reviewsHandler.addReview(review);
          
          expect(response).to.be.instanceof(AWSErrorResponse);
          expect(response.success).to.be.false;
          expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
          expect(response.message).to.equal(mockGenericDynamoError.message);
      });
    });

    describe('when adding a review for a preexisting place', () => {
      it('attaches image URLs when image files are provided and returns success message if transaction write command succeeds', async () => {
        // Prepare a review without a reviewId
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;

        // Prepare a preexisting place
        const place = deepCopy(mockPlaces[0]);

        // Create a fake image file array (simulate file objects)
        const fakeImage1 = {
          originalname: 'image1.jpg',
          buffer: Buffer.from('fake-image-data-1')
        };
        const fakeImage2 = {
          originalname: 'image2.png',
          buffer: Buffer.from('fake-image-data-2')
        };
        const imageFiles = [fakeImage1, fakeImage2];

        // Simulate that the place exists (update place)
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });

        // For the transaction call to add the new place and review, simulate success.
        ddbMock.on(TransactWriteCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Simulate S3 upload responses for each image file.
        // For each PutObjectCommand, return a success response.
        s3ClientMock.on(PutObjectCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Call addReview with imageFiles
        const response = await reviewsHandler.addReview(review, imageFiles);

        // Verify that the transaction succeeded.
        assert.deepEqual(response, {
          success: true,
          DBError: undefined
        });

        // Verify that uploadReviewImages was called for each image file.
        // Since addReview calls this.handleImagesFiles, which in turn calls uploadReviewImages,
        // we expect two PutObjectCommand calls to have been made.
        const putCommands = s3ClientMock.commandCalls(PutObjectCommand);
        assert.equal(putCommands.length, imageFiles.length);

        // Check that the command input for each call has a Key in the format "<reviewId>/<originalname>"
        // We cannot know the generated reviewId, but we can assert that the Key includes a slash and the filename.
        putCommands.forEach((putCommandCall, index) => {
          const input = putCommandCall.args[0].input;
          // Check that the key contains a slash and the original name of the image.
          assert.isTrue(input.Key.includes('/'));
          assert.isTrue(input.Key.endsWith(imageFiles[index].originalname));
        });
      });

      it('does not attempt to upload images if no image files are provided and returns success message if transaction write command succeeds', async () => {
        // Prepare a review without image files.
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;

        // Prepare a preexisting place
        const place = deepCopy(mockPlaces[0]);

        // Simulate that the place exists (update place)
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });

        // For the transaction call to add the new place and review, simulate success.
        ddbMock.on(TransactWriteCommand).resolves({
          $metadata: {
            httpStatusCode: 200
          }
        });

        // Call addReview without imageFiles
        const response = await reviewsHandler.addReview(review, []);

        // Verify that the transaction succeeded.
        assert.deepEqual(response, {
          success: true,
          DBError: undefined
        });

        // Verify that no PutObjectCommand was called (i.e. no image uploads occurred)
        const putCommands = s3ClientMock.commandCalls(PutObjectCommand);
        assert.equal(putCommands.length, 0);
      });

      it('returns AWSErrorResponse if transaction write command returns error', async () => {
        const review = deepCopy(mockReviews[0]);
        delete review.reviewId;
        const place = deepCopy(mockPlaces[0]);

        // call for getPlaceByPlaceId
        ddbMock.on(QueryCommand, {
          TableName: 'Places',
          ExpressionAttributeValues: {
            ':placeId': review.placeId,
          },
          KeyConditionExpression: 'placeId = :placeId',
          ConsistentRead: true,
        }).resolves({
          Items: [place]
        });
  
        // call for TransactWriteCommand
        ddbMock.on(TransactWriteCommand).rejects(mockGenericDynamoError);
  
        const response = await reviewsHandler.addReview(review);
        
        expect(response).to.be.instanceof(AWSErrorResponse);
        expect(response.success).to.be.false;
        expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
        expect(response.message).to.equal(mockGenericDynamoError.message);
      });
    });
  });

  describe('updateReview', () => {
    it('returns success message if transaction write command succeeds', async () => {
      const review = deepCopy(mockReviews[0]);
      const place = deepCopy(mockPlaces[0]);

      // call for getReviewByReviewId
      ddbMock.on(QueryCommand, {
        TableName: 'Reviews',
        ExpressionAttributeValues: {
          ':reviewId': review.reviewId,
        },
        KeyConditionExpression: 'reviewId = :reviewId',
        ConsistentRead: true,
      }).resolves({
        Items: [review]
      });

      // call for getPlaceByPlaceId
      ddbMock.on(QueryCommand, {
        TableName: 'Places',
        ExpressionAttributeValues: {
          ':placeId': review.placeId,
        },
        KeyConditionExpression: 'placeId = :placeId',
        ConsistentRead: true,
      }).resolves({
        Items: [place]
      });

      // call for TransactWriteCommand
      ddbMock.on(TransactWriteCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });

      const response = await reviewsHandler.updateReview(review);

      assert.deepEqual(response, {
        success: true,
        DBError: undefined,
      });
    });

    it('returns AWSErrorResponse if transaction write command returns error', async () => {
      const review = deepCopy(mockReviews[0]);
      const place = deepCopy(mockPlaces[0]);

      // call for getReviewByReviewId
      ddbMock.on(QueryCommand, {
        TableName: 'Reviews',
        ExpressionAttributeValues: {
          ':reviewId': review.reviewId,
        },
        KeyConditionExpression: 'reviewId = :reviewId',
        ConsistentRead: true,
      }).resolves({
        Items: [review]
      });

      // call for getPlaceByPlaceId
      ddbMock.on(QueryCommand, {
        TableName: 'Places',
        ExpressionAttributeValues: {
          ':placeId': review.placeId,
        },
        KeyConditionExpression: 'placeId = :placeId',
        ConsistentRead: true,
      }).resolves({
        Items: [place]
      });

      // call for TransactWriteCommand
      ddbMock.on(TransactWriteCommand).rejects(mockGenericDynamoError);

      const response = await reviewsHandler.updateReview(review);
      
      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  })
});