const supertest = require('supertest');
const { expect, assert } = require('chai');
const mockReviews = require('../mockDataBase/reviews')
const app = require('../app');

const { docClient, QueryCommand, PutCommand, UpdateCommand, ScanCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { addReview } = require('../databaseAccess/reviewsDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { deepCopy } = require('../utils/utils');
const ddbMock = mockClient(docClient);

describe('reviewsController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });
  describe('POST /createReview', () => {
    it('returns error if review contains unsupported field', async () => {
      const testReview = deepCopy(mockReviews[0]);
      const response = await supertest(app)
      .post('/reviews/createReview')
      .send(testReview)
      .expect(400);

      expect(response.body.errorInField?.[0]).to.equal('reviewId');
      expect(response.body.reasonForError).to.equal('"reviewId" is not allowed');
      assert.deepEqual(response.body.originatingRequest, testReview);
    });

    it('returns error if review contains field in wrong format', async () => {
      const testReview = deepCopy(mockReviews[0]);
      delete testReview.reviewId;
      testReview.beers = true;

      const response = await supertest(app)
      .post('/reviews/createReview')
      .send(testReview)
      .expect(400);

      expect(response.body.errorInField?.[0]).to.equal('beers');
      expect(response.body.reasonForError).to.equal('"beers" must be a number');
      assert.deepEqual(response.body.originatingRequest, testReview);
    });

    it('returns correct response if review addition is successful', async () => {
      ddbMock.on(PutCommand).resolves({
        Items: [mockReviews[0]]
      });

      const testReview = deepCopy(mockReviews[0]);
      delete testReview.reviewId;

      const response = await supertest(app)
        .post('/reviews/createReview')
        .send(testReview)
        .expect(200);

      assert.deepEqual(response.body, {
        addReviewResponse: {
          success: true
        },
        placeResponse: {
          addPlaceResponse: {
            success: true
          }
        }
      });
    });
  });
})