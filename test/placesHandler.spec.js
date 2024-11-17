const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');
const { SchemaError } = require('../errors/SchemaError');
const { DynamoError } = require('../errors/DynamoError');

const { docClient, QueryCommand, PutCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);

describe('placesHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getPlaceByPlaceId', () => {
    it('throws error if placeId is null', async () => {
      try {
        await placesHandler.getPlaceByPlaceId();
      } catch (error) {
        expect(error).to.be.instanceof(DynamoError);
        expect(error.statusCode).to.equal(400)
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

    it('returns place returned from dynamo', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [mockPlaces[0]]
      });
      
      const response = await placesHandler.getPlaceByPlaceId('place1');
      assert.deepEqual(response, {
        success: true,
        place: mockPlaces[0],
        DBError: undefined
      });
    });
  });

  describe('addPlace', () => {
    it('throws error if placeName is missing', async () => {
      try {
        await placesHandler.addPlace({
          beers: 1,
          benny: 1,
          bloody: 1,
          burger: 1,
          words: 'some words'
        });
      } catch (error) {
        expect(error).to.be.instanceOf(SchemaError);
        expect(error.reasonForError).to.equal('"placeName" is required');
      }
    });

    it('throws error if placeName is not a string', async () => {
      try {
        await placesHandler.addPlace({
          placeName: 1,
          beers: 1,
          benny: 1,
          bloody: 1,
          burger: 1,
          words: 'some words'
        });
      } catch (error) {
        expect(error).to.be.instanceOf(SchemaError);
        expect(error.reasonForError).to.equal('"placeName" must be a string');
      }
    });

    it('returns success upon successful addition to dynamo', async () => {
      ddbMock.on(PutCommand).resolves({
        Items: [mockPlaces[0]]
      });

      const response = await placesHandler.addPlace({
          placeName: 'some place',
          beers: 1,
          benny: 1,
          bloody: 1,
          burger: 1,
          words: 'some words'
        });
        assert.deepEqual(response, {success: true});
    });
  });
});