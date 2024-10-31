const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');

describe('placesHandler', () => {
  describe('getPlaces', () => {
    it('returns places', () => {
      const response = placesHandler.getPlaces();
      assert.deepEqual(response, mockPlaces);
    });
  });

  describe('getPlaceByPlaceId', () => {
    it('returns only the place that matches placeId', () => {
      let response = placesHandler.getPlaceByPlaceId('place1');
      assert.deepEqual(response, mockPlaces[0]);

      response = placesHandler.getPlaceByPlaceId('place2');
      assert.deepEqual(response, mockPlaces[1]);

      response = placesHandler.getPlaceByPlaceId('place3');
      assert.deepEqual(response, mockPlaces[2]);
    });

    it('returns null if no place matches placeId', () => {
      const response = placesHandler.getPlaceByPlaceId('place4');
      expect(response).to.be.null;
    });

    it('returns null if placeId is null', () => {
      const response = placesHandler.getPlaceByPlaceId();
      expect(response).to.be.null;
    });

    it('returns null if placeId is not a string', () => {
      let response = placesHandler.getPlaceByPlaceId(1);
      expect(response).to.be.null;

      response = placesHandler.getPlaceByPlaceId(true);
      expect(response).to.be.null;

      response = placesHandler.getPlaceByPlaceId({});
      expect(response).to.be.null;

      response = placesHandler.getPlaceByPlaceId([]);
      expect(response).to.be.null;
    });
  });

  describe('addPlace', () => {
    it('adds a place to places', () => {
      const toAdd = {
        placeId: 'place4',
        placeName: 'Royal Tavern',
        numberOfReviews: 1,
        overallRating: 2.5,
        beers: 1,
        benny: 2,
        bloody: 3,
        burger: 4,
      };
      const response = placesHandler.addPlace(toAdd);
      expect(response).to.contain(toAdd);
    });
  });
});