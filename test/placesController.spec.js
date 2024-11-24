const supertest = require('supertest');
const { assert, expect } = require('chai');
const mockPlaces = require('../mockDataBase/places');
const app = require('../app');

const { docClient, QueryCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { deepCopy } = require('../utils/utils');
const ddbMock = mockClient(docClient);


describe('placesController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('GET /byPlaceId/:placeId', () => {
    it('returns 404 if placeId is missing', async () => {
      await supertest(app)
        .get('/places/byPlaceId/')
        .expect(404);
    });

    it('returns place found by dynamo', async () => {
      const place = deepCopy(mockPlaces[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [place]
      })
      const response = await supertest(app)
        .get('/places/byPlaceId/place1')
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
      .get('/places/byPlaceId/place1')
      .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        placeExists: false
      });
    });
  });
});



