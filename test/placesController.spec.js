const supertest = require('supertest');
const { assert, expect } = require('chai');
const mockPlaces = require('../mockDataBase/places');
const app = require('../app');

const { docClient, QueryCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);


describe('placesController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('GET /byPlaceId/:placeId', () => {
    it('returns correct place', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [mockPlaces[0]]
      })
      const response = await supertest(app)
        .get('/places/byPlaceId/place1')
        .expect(200);
        
      assert.deepEqual(response.body, mockPlaces[0]);
    });

    it('throws error if no place is found', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: []
      })
      
      const response = await supertest(app)
      .get('/places/byPlaceId/place1')
      .expect(404);

      expect(response.body.message).to.equal('No Place Found with placeId: place1');
    });
  });
});



