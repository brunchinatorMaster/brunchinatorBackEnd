const { expect, assert } = require('chai');
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();
const mockPlaces = require('../mockDataBase/places');
const { docClient, QueryCommand, PutCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { deepCopy } = require('../utils/utils');

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

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);

      const response = await placesHandler.getPlaceByPlaceId('place1');

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('addPlace', () => {
    it('returns BadSchemaResponse if placeName is missing', async () => {
      const response = await placesHandler.addPlace({
        placeId: '123',
        bloody: 1,
        burger: 1,
        words: 'some words'
      });

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" is required');
      
    });

    it('returns BadSchemaResponse if placeName is not a string', async () => {
      const response = await placesHandler.addPlace({
        placeId: '123',
        placeName: 1,
        bloody: 1,
        burger: 1,
        words: 'some words'
      });
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" must be a string');
    });

    it('returns BadSchemaResponse if placeName is an empty string', async () => {
      const response = await placesHandler.addPlace({
        placeId: '123',
        placeName: '',
        bloody: 1,
        burger: 1,
        words: 'some words'
      });
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"placeName" cannot be an empty string');
    });

    it('returns success upon successful addition to dynamo', async () => {
      ddbMock.on(PutCommand).resolves({
        not: 'an error'
      });

      const response = await placesHandler.addPlace({
          placeId: '123',
          placeName: 'some place',
          bloody: 1,
          burger: 1,
          words: 'some words'
        });

      assert.deepEqual(response, {success: true});
    });

    it('returns DBErrorResponse if dynamo throws error', async () => {
      ddbMock.on(PutCommand).rejects(mockGenericDynamoError);
      const response = await placesHandler.addPlace({
        placeId: '123',
        placeName: 'some place',
        bloody: 1,
        burger: 1,
        words: 'some words'
      });

      expect(response).to.be.instanceof(DBErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });
});