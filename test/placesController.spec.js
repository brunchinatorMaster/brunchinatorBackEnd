const supertest = require('supertest');
const { assert } = require('chai');
const mockPlaces = require('../mockDataBase/places');

const app = require('../app');


describe('GET /all', () => {
  it('returns all places', async () => {
    const response = await supertest(app)
      .get('/places/all')
      .expect(200);
      
    assert.deepEqual(response.body, mockPlaces);
  });
});

describe('GET /byPlaceId/:placeId', () => {
  it('returns correct place', async () => {
    const response = await supertest(app)
      .get('/places/byPlaceId/place1')
      .expect(200);
      
    assert.deepEqual(response.body, mockPlaces[0]);
  });
});
