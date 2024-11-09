const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');
const { SchemaError } = require('../errors/SchemaError');

describe('placesHandler', () => {
  describe('getPlaces', () => {
    it('returns places', async () => {
      const response = await placesHandler.getPlaces();
      assert.deepEqual(response, mockPlaces);
    });
  });

  describe('getPlaceByPlaceId', () => {
    it('returns only the place that matches placeId', async () => {
      let response = await placesHandler.getPlaceByPlaceId('place1');
      assert.deepEqual(response, mockPlaces[0]);

      response = await placesHandler.getPlaceByPlaceId('place2');
      assert.deepEqual(response, mockPlaces[1]);

      response = await placesHandler.getPlaceByPlaceId('place3');
      assert.deepEqual(response, mockPlaces[2]);
    });

    it('returns null if no place matches placeId', async () => {
      const response = await placesHandler.getPlaceByPlaceId('place4');
      expect(response).to.be.null;
    });

    it('returns null if placeId is null', async () => {
      const response = await placesHandler.getPlaceByPlaceId();
      expect(response).to.be.null;
    });

    it('throws SchemaError if placeId is invalid', async () => {
      try {
        await placesHandler.getPlaceByPlaceId(1);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a string');
        expect(error.originatingRequest).to.equal(1);
      }
    });
  });

  describe('addPlace', () => {
    it('adds a place to places', async () => {
      const toAdd = {
        placeName: 'Royal Tavern',
        beers: 1,
        benny: 2,
        bloody: 3,
        burger: 4,
      };
      const response = await placesHandler.addPlace(toAdd);
      expect(response).to.contain(toAdd);
    });
  });
});