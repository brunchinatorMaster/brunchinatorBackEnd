const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const mockUsers = require('../mockDataBase/users');

const { docClient, QueryCommand, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { deepCopy, JWT_SECRET } = require('../utils/utils');
const ddbMock = mockClient(docClient);
const jwt = require('jsonwebtoken');
const { sanitizeUser } = require('../utils/usersUtils');
const sinon = require('sinon');
const nodemailer = require('nodemailer');

describe('usersHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getUserByUsername', () => {
    it('returns BadSchemaResponse is userName is invalid', async () => {
      const response = await usersHandler.getUserByUsername(12345);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns user found by dynamo', async () => {
      const user = deepCopy(mockUsers[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [user]
      });
  
      const response = await usersHandler.getUserByUsername('geo');

      assert.deepEqual(response, {
        success: true,
        userExists: true,
        user: {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        }
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);

      const response = await usersHandler.getUserByUsername('geo');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('getUserByEmail', () => {
    it('returns BadSchemaResponse is email is invalid', async () => {
      
      const response = await usersHandler.getUserByEmail('tohearstories@gmail');
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"value" must be a valid email');
    });

    it('returns user found by dynamo', async () => {
      const user = deepCopy(mockUsers[0]);
      ddbMock.on(ScanCommand).resolves({
        Items: [user]
      });
  
      const response = await usersHandler.getUserByEmail('tohearstories@gmail.com');

      assert.deepEqual(response, {
        success: true,
        userExists: true,
        user: {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        }
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);

      const response = await usersHandler.getUserByEmail('tohearstories@gmail.com');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('addUser', () => {
    let createTransportStub;
    let sendMailStub;

    beforeEach(() => {
      sendMailStub = sinon.stub().resolves({
        messageId: '456'
      });
      createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailStub
      });
    });

    afterEach(() => {
      createTransportStub.restore();
    });

    it('returns BadSchemaResponse if email is missing', async () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"email" is required');
    });

    it('returns BadSchemaResponse if email is not a valid email', async () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword',
        email: 'tohearstories@gmail'
      };

      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"email" must be a valid email');
    });

    it('returns BadSchemaResponse if userName is missing', async () => {
      const toAdd = {
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };

      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" is a required field');
    });

    it('returns BadSchemaResponse if userName is not a string', async () => {
      const toAdd = {
        userName: 123,
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns BadSchemaResponse if userName is an empty string', async () => {
      const toAdd = {
        userName: '',
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" cannot be an empty string');
    });

    it('returns BadSchemaResponse if password is missing', async () => {
      const toAdd = {
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" is a required field');
    });

    it('returns BadSchemaResponse if password is not a string', async () => {
      const toAdd = {
        userName: 'someName',
        password: 123,
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" must be a string');
    });

    it('returns BadSchemaResponse if password is an empty string', async () => {
      const toAdd = {
        userName: 'someName',
        password: '',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.addUser(toAdd);
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" cannot be an empty string');
    });

    it('returns passwordless user and token upon successful user creation', async () => {
      const user = deepCopy(mockUsers[0]);
      ddbMock.on(PutCommand).resolves({
        Items: [user]
      });

      const token = jwt.sign({
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      }, JWT_SECRET);

      const toAdd = {
        userName: 'someName',
        password: 'password',
        email: 'tohearstories@gmail.com'
      };

      const response = await usersHandler.addUser(toAdd);

      assert.deepEqual(response.user, {
        userName: 'someName',
        email: 'tohearstories@gmail.com',
        token,
      });
      expect(response.token).to.be.not.null;
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(PutCommand).rejects(mockGenericDynamoError);

      const toAdd = {
        userName: 'someName',
        password: 'password',
        email: 'tohearstories@gmail.com'
      };

      const response = await usersHandler.addUser(toAdd);

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('updateUserPassword', () => {
    it('returns BadSchemaResponse if userName is missing', async () => {
      const toUpdate = {
        password: 'somePassword',
        email: 'tohearstories@gmail.com',
        resetCode: 12345,
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" is a required field');
    });

    it('returns BadSchemaResponse if userName is not a string', async () => {
      const toUpdate = {
        userName: 123,
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns BadSchemaResponse if userName is an empty string', async () => {
      const toUpdate = {
        userName: '',
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" cannot be an empty string');
    });

    it('returns BadSchemaResponse if password is missing', async () => {
      const toUpdate = {
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" is a required field');
    });

    it('returns BadSchemaResponse if password is not a string', async () => {
      const toUpdate = {
        userName: 'someName',
        password: 123,
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" must be a string');
    });

    it('returns BadSchemaResponse if password is an empty string', async () => {
      const toUpdate = {
        userName: 'someName',
        password: '',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUserPassword(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" cannot be an empty string');
    });

    it('returns success:true if user update is successful', async () => {
      const user = deepCopy(mockUsers[0]);
      user.resetCode = 12345;
      ddbMock.on(QueryCommand).resolves({
        Items: [user]
      });

      const toSend = deepCopy(mockUsers[0]);
      delete toSend.email;
      toSend.resetCode = 12345;
      ddbMock.on(UpdateCommand).resolves({
        Attributes: toSend
      });

      const response = await usersHandler.updateUserPassword(toSend);

      delete user.email;
      const updatedUser = sanitizeUser(user);
			token = jwt.sign(updatedUser, JWT_SECRET);
			updatedUser.token = token;

      assert.deepEqual(response, {
        success: true,
        user: updatedUser,
      });
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      const user = deepCopy(mockUsers[0]);
      user.resetCode = 12345;
      ddbMock.on(QueryCommand).resolves({
        Items: [user]
      });

      const toSend = deepCopy(mockUsers[0]);
      delete toSend.email;
      toSend.resetCode = 12345;
      ddbMock.on(UpdateCommand).rejects(mockGenericDynamoError);

      const response = await usersHandler.updateUserPassword(toSend);

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('login', () => {
    it('returns BadSchemaResponse if username is not a string', async () => {
      const userName = 1;
      const password = 'some string';
      
      const response = await usersHandler.login(userName, password);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns BadSchemaResponse  if username is an empty string', async () => {
      const userName = '';
      const password = 'some string';

      const response = await usersHandler.login(userName, password);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" cannot be an empty string');
    });

    it('returns BadSchemaResponse if password is not a string', async () => {
      const userName = 'geo';
      const password = 1;

      const response = await usersHandler.login(userName, password);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" must be a string');
    });

    it('returns BadSchemaResponse if password is an empty string', async () => {
      const userName = 'geo';
      const password = '';

      const response = await usersHandler.login(userName, password);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" cannot be an empty string');
    });

    it('returns passwordless user and token upon successful login', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [{
          userName: 'geo',
          email: 'tohearstories@gmail.com',
          password: 'geoPassword'
        }]
      });

      const token = jwt.sign({
        userName: 'geo',
        email: 'tohearstories@gmail.com',
      }, JWT_SECRET);

      const response = await usersHandler.login('geo', 'geoPassword');
      assert.deepEqual(response.user, {
          userName: 'geo',
          email: 'tohearstories@gmail.com',
          token,
      });
      expect(response.token).to.be.not.null;
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);

      const response = await usersHandler.login('geo', 'geoPassword');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });

  describe('deleteUser', () => {
    it('returns BadSchemaResponse is userName is missing', async () => {
      const response = await usersHandler.deleteUser();
      
      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" is a required field');
    });

    it('returns BadSchemaResponse is userName is not a string', async () => {
      const response = await usersHandler.deleteUser(123);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns success:true if user delete is successful', async () => {
      ddbMock.on(DeleteCommand).resolves({
        not: 'an error'
      });

      const response = await usersHandler.deleteUser('someUserName');

      assert.deepEqual(response, {success: true});
    });

    it('returns AWSErrorResponse if dynamo throws error', async () => {
      ddbMock.on(DeleteCommand).rejects(mockGenericDynamoError);

      const response = await usersHandler.deleteUser('someUserName');

      expect(response).to.be.instanceof(AWSErrorResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(mockGenericDynamoError.$metadata.httpStatusCode);
      expect(response.message).to.equal(mockGenericDynamoError.message);
    });
  });
});