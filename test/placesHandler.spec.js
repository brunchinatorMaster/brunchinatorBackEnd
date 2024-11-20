const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');
const { SchemaError } = require('../errors/SchemaError');
const { DynamoError } = require('../errors/DynamoError');

const { docClient, QueryCommand, PutCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const ddbMock = mockClient(docClient);

describe('placesHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getPlaceByPlaceId', () => {
    it('returns BadSchemaResponse if placeId is null', async () => {
      const response = await placesHandler.getPlaceByPlaceId();
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeId" is a required field');
    });

    it('returns BadSchemaResponse if placeId is invalid', async () => {
      const response = await placesHandler.getPlaceByPlaceId(1);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeId" must be a string');
    });

    it('returns BadSchemaResponse if placeId is an empty string', async () => {
      const response = await placesHandler.getPlaceByPlaceId('');

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeId" cannot be an empty string');
    });

    it('returns place returned from dynamo', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [mockPlaces[0]]
      });
      
      const response = await placesHandler.getPlaceByPlaceId('place1');
      assert.deepEqual(response, {
        success: true,
        placeExists: true,
        place: mockPlaces[0],
      });
    });
  });

  describe('addPlace', () => {
    it('returns BadSchemaResponse if placeName is missing', async () => {
      const response = await placesHandler.addPlace({
        beers: 1,
        benny: 1,
        bloody: 1,
        burger: 1,
        words: 'some words'
      });

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" is required');
      
    });

    it('throws error if placeName is not a string', async () => {
      const response = await placesHandler.addPlace({
        placeName: 1,
        beers: 1,
        benny: 1,
        bloody: 1,
        burger: 1,
        words: 'some words'
      });
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" must be a string');
    });

    it('throws error if placeName is an empty string', async () => {
      const response = await placesHandler.addPlace({
        placeName: '',
        beers: 1,
        benny: 1,
        bloody: 1,
        burger: 1,
        words: 'some words'
      });
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" is not allowed to be empty');
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