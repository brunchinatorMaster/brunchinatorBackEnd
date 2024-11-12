const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');
const { SchemaError } = require('../errors/SchemaError');

describe('placesHandler', () => {
  describe('getPlaceByPlaceId', () => {
    it('throws error if placeId is null', async () => {
      try {
        await placesHandler.getPlaceByPlaceId();
      } catch (error) {
        console.log(error)
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.equal('placeId must not be null');
      }
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
  });
});