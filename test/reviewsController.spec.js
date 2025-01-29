const supertest = require('supertest');
const { assert } = require('chai');
const mockReviews = require('../mockDataBase/reviews')
const app = require('../app');

const { docClient, PutCommand, ScanCommand, QueryCommand, TransactWriteCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { deepCopy } = require('../utils/utils');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const mockPlaces = require('../mockDataBase/places');
const ddbMock = mockClient(docClient);

describe('reviewsController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('GET /ALL', () => {
    it('returns reviews', async () => { 
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: reviews
      });

      const response = await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/all')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        reviews: reviews
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/all')
        .expect(403);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
          message: mockGenericDynamoError.message,
          error: {
            $metadata: mockGenericDynamoError.$metadata
          }
        });
    });
  });

  describe('GET /byReviewId/:reviewId', () => {
    it('returns 404 if reviewId is missing', async () => {
      await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byReviewId')
        .expect(404);
    });

    it('returns review found by dynamo', async () => {
      const review = deepCopy(mockReviews[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [review]
      });
  
      const response = await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byReviewId/review1')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        reviewExists: true,
        review,
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .get('/brunchinatorBackend/reviews/api/v1/byReviewId/review1')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('GET /byPlaceId/:placeId', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byPlaceId/')
        .expect(404);
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[1], reviews[2]]
      });
  
      const response = await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byPlaceId/place2')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[1], reviews[2]],
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .get('/brunchinatorBackend/reviews/api/v1/byPlaceId/place1')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('GET /byUserName/:userName', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byUserName/')
        .expect(404);
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[0], reviews[1]]
      });
  
      const response = await supertest(app)
        .get('/brunchinatorBackend/reviews/api/v1/byUserName/geo')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        reviewsExist: true,
        reviews: [reviews[0], reviews[1]],
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .get('/brunchinatorBackend/reviews/api/v1/byUserName/geo')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('POST /createReview', () => {
    it('returns appropriate response if review contains unsupported field', async () => {
      const testReview = deepCopy(mockReviews[0]);
      const response = await supertest(app)
      .post('/brunchinatorBackend/reviews/api/v1/createReview')
      .send(testReview)
      .expect(400);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: 400,
        message: '"reviewId" is not allowed'
      });
    });

    it('returns appropriate response if review contains field in wrong format', async () => {
      const testReview = deepCopy(mockReviews[0]);
      delete testReview.reviewId;
      testReview.burger = true;

      const response = await supertest(app)
      .post('/brunchinatorBackend/reviews/api/v1/createReview')
      .send(testReview)
      .expect(400);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: 400,
        message: '"burger" must be a number'
      });
    });

    it('returns correct response if review addition is successful', async () => {
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
      ddbMock.on(TransactWriteCommand).resolves({
        $metadata: {
          httpStatusCode: 200
        }
      });
      
      const response = await supertest(app)
        .post('/brunchinatorBackend/reviews/api/v1/createReview')
        .send(review)
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
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
      
      ddbMock.on(TransactWriteCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
        .post('/brunchinatorBackend/reviews/api/v1/createReview')
        .send(review)
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });
})