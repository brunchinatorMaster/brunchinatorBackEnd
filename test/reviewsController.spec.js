const supertest = require('supertest');
const { expect, assert } = require('chai');
const mockReviews = require('../mockDataBase/reviews')
const app = require('../app');

const { docClient, PutCommand, ScanCommand, QueryCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { deepCopy } = require('../utils/utils');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
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
        .get('/reviews/all')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        reviews: reviews
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await supertest(app)
        .get('/reviews/all')
        .expect(403);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
          message: mockGenericDynamoError.message
        });
    });
  });

  describe('GET /byReviewId/:reviewId', () => {
    it('returns 404 if reviewId is missing', async () => {
      await supertest(app)
        .get('/reviews/byReviewId/')
        .expect(404);
    });

    it('returns review found by dynamo', async () => {
      const review = deepCopy(mockReviews[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [review]
      });
  
      const response = await supertest(app)
        .get('/reviews/byReviewId/review1')
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
      .get('/reviews/byReviewId/review1')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message
      });
    });
  });

  describe('GET /byPlaceId/:placeId', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/reviews/byPlaceId/')
        .expect(404);
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[1], reviews[2]]
      });
  
      const response = await supertest(app)
        .get('/reviews/byPlaceId/place2')
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
      .get('/reviews/byPlaceId/place1')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message
      });
    });
  });

  describe('GET /byUserName/:userName', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/reviews/byUserName/')
        .expect(404);
    });

    it('returns reviews found by dynamo', async () => {
      const reviews = deepCopy(mockReviews);
      ddbMock.on(ScanCommand).resolves({
        Items: [reviews[0], reviews[1]]
      });
  
      const response = await supertest(app)
        .get('/reviews/byUserName/geo')
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
      .get('/reviews/byUserName/geo')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message
      });
    });
  });

  describe('POST /createReview', () => {
    it('returns appropriate response if review contains unsupported field', async () => {
      const testReview = deepCopy(mockReviews[0]);
      const response = await supertest(app)
      .post('/reviews/createReview')
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
      testReview.beers = true;

      const response = await supertest(app)
      .post('/reviews/createReview')
      .send(testReview)
      .expect(400);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: 400,
        message: '"beers" must be a number'
      });
    });

    it('returns correct response if review addition is successful', async () => {
      const review = deepCopy(mockReviews[0]);
      ddbMock.on(PutCommand).resolves({
        Items: [review]
      });
      
      delete review.reviewId;

      const response = await supertest(app)
        .post('/reviews/createReview')
        .send(review)
        .expect(200);

      assert.deepEqual(response.body, {
        addReviewResponse: {
          success: true,
        },
        placeResponse: {
          success: true
        }
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(PutCommand).rejects(mockGenericDynamoError);
  
      const review = deepCopy(mockReviews[0]);
      delete review.reviewId;
      const response = await supertest(app)
        .post('/reviews/createReview')
        .send(review)
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message
      });
    });
  });
})