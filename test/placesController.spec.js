const supertest = require('supertest');
const { assert, expect } = require('chai');
const mockPlaces = require('../mockDataBase/places');
const app = require('../app');

const { docClient, QueryCommand, ScanCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { deepCopy } = require('../utils/utils');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const ddbMock = mockClient(docClient);


describe('placesController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('GET /ALL', () => {
    it('returns places', async () => { 
      const places = deepCopy(mockPlaces);
      ddbMock.on(ScanCommand).resolves({
        Items: places
      });

      const response = await supertest(app)
        .get('/brunchinatorBackend/places/api/v1/all')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        places: places
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await supertest(app)
        .get('/brunchinatorBackend/places/api/v1/all')
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

  describe('GET /byPlaceId/:placeId', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/brunchinatorBackend/places/api/v1/byPlaceId/')
        .expect(404);
    });

    it('returns place found by dynamo', async () => {
      const place = deepCopy(mockPlaces[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [place]
      })
      const response = await supertest(app)
        .get('/brunchinatorBackend/places/api/v1/byPlaceId/place1')
        .expect(200);
        
      assert.deepEqual(response.body, {
        success: true,
        placeExists: true,
        place,
      });
    });

    it('returns 200 if no place is found with placeExists: false', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: []
      })
      
      const response = await supertest(app)
      .get('/brunchinatorBackend/places/api/v1/byPlaceId/place1')
      .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        placeExists: false
      });
    });
  });
});



