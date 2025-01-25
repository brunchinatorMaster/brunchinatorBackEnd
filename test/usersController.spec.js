const supertest = require('supertest');
const { expect, assert } = require('chai');
const mockUsers = require('../mockDataBase/users')
const app = require('../app');

const { docClient, QueryCommand, PutCommand, UpdateCommand, ScanCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);
const { mockGenericDynamoError } = require('./mockDynamoResponses');
const { deepCopy, JWT_SECRET } = require('../utils/utils');
const { sanitizeUser } = require('../utils/usersUtils');
const jwt = require('jsonwebtoken');

describe('usersController', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('POST /createUser', () => {
    it('returns error if email is missing', async () => {
      const toSend = {
        userName: 'some username',
        password: 'somePassword'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"email" is required');
    });

    it('returns error if email is not a valid email', async () => {
      const toSend = {
        userName: 'some username',
        password: 'somePassword',
        email: 'address@domain'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"email" must be a valid email');
    });

    it('returns error if userName is missing', async () => {
      const toSend = {
        password: 'somePassword',
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"userName" is a required field');
    });

    it('returns error if userName is not a string', async () => {
      const toSend = {
        userName: 123,
        password: 'somePassword',
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"userName" must be a string');
    });

    it('returns error if password is missing', async () => {
      const toSend = {
        userName: 'someName',
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"password" is a required field');
    });

    it('returns error if password is not a string', async () => {
      const toSend = {
        userName: 'someName',
        password: 123,
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"password" must be a string');
    });

    it('returns success:true if user addition is successful', async () => {
      const toSend = deepCopy(mockUsers[0]);
      ddbMock.on(PutCommand).resolves({
        Items: [toSend]
      });

      const response = await supertest(app)
        .post('/users/createUser')
        .send(toSend)
        .expect(200);

      const cleanUser = sanitizeUser(toSend);
      const token = jwt.sign(cleanUser, JWT_SECRET);

      assert.deepEqual(response.body, {
        success: true,
        user: {
          email: toSend.email,
          userName: toSend.userName,
          token,
        }
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      const toSend = deepCopy(mockUsers[0]);
      ddbMock.on(PutCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .post('/users/createUser')
        .send(toSend)
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('POST /updateUserPassword', () => {
    it('returns error if userName is missing', async () => {
      const toSend = {
        password: 'somePassword',
        resetCode: 12345,
      };
  
      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"userName" is a required field');
    });

    it('returns error if userName is not a string', async () => {
      const toSend = {
        userName: 123,
        password: 'somePassword',
        resetCode: 12345,
      };
  
      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"userName" must be a string');
    });

    it('returns error if password is missing', async () => {
      const toSend = {
        userName: 'someName',
        resetCode: 12345,
      };
  
      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"password" is a required field');
    });

    it('returns error if password is not a string', async () => {
      const toSend = {
        userName: 'someName',
        password: 123,
        resetCode: 12345,
      };
  
      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(400);
  
        expect(response.body.success).to.equal(false);
        expect(response.body.statusCode).to.equal(400);
        expect(response.body.message).to.equal('"password" must be a string');
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

      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        updatedUser: {
          userName: 'geo'
        }
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      const user = deepCopy(mockUsers[0]);
      user.resetCode = 12345;
      ddbMock.on(QueryCommand).resolves({
        Items: [user]
      });

      const toSend = deepCopy(mockUsers[0]);
      delete toSend.email;
      toSend.resetCode = 12345;
      ddbMock.on(UpdateCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
        .post('/users/updateUserPassword')
        .send(toSend)
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('GET /byEmail/:email', () => {
    it('returns 404 if userName is missing', async () => {
      await supertest(app)
        .get('/users/byEmail/')
        .expect(404);
    });

    it('returns error if email is invalid', async () => {
      const response = await supertest(app)
        .get('/users/byEmail/tohearstories@gmail')
        .expect(400);
        
        expect(response.body.message).to.equal('"value" must be a valid email');
        expect(response.body.statusCode).to.equal(400);
    });

    it('returns user found by dynamo', async () => {
      const toSend = deepCopy(mockUsers[0]);
      ddbMock.on(ScanCommand).resolves({
        Items: [toSend]
      });
  
      const response = await supertest(app)
        .get('/users/byEmail/tohearstories@gmail.com')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        userExists: true,
        user: {
          userName: mockUsers[0].userName,
          email: mockUsers[0].email
        }
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(ScanCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .get('/users/byEmail/tohearstories@gmail.com')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('GET /byUsername/:userName', () => {
    it('returns 404 if userName is missing', async () => {
      await supertest(app)
        .get('/users/byUsername/')
        .expect(404);
    });

    it('returns user found by dynamo', async () => {
      const toSend = deepCopy(mockUsers[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [toSend]
      });
  
      const response = await supertest(app)
        .get('/users/byUsername/geo')
        .expect(200);

      assert.deepEqual(response.body, {
        success: true,
        userExists: true,
        user: {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        }
      });
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
        .get('/users/byUsername/geo')
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });

  describe('POST /login', () => {
    it('returns error if username is missing', async () => {
      const toSend = {
        password: 'somePassword'
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"userName" must be a string',
        });
    });

    it('returns error if username is an empty string', async () => {
      const toSend = {
        userName: '',
        password: 'somePassword'
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"userName" cannot be an empty string',
        });
    });

    it('returns error if username is not a string', async () => {
      const toSend = {
        userName: 123,
        password: 'somePassword'
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"userName" must be a string',
        });
    });

    it('returns error if password is missing', async () => {
      const toSend = {
        userName: 'geo',
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"password" must be a string',
        });
    });

    it('returns error if password is an empty string', async () => {
      const toSend = {
        userName: 'geo',
        password: ''
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"password" cannot be an empty string',
        });
    });

    it('returns error if password is not a string', async () => {
      const toSend = {
        userName: 'geo',
        password: 123
      };
  
      const response = await supertest(app)
        .post('/users/login')
        .send(toSend)
        .expect(400);

        assert.deepEqual(response.body, {
          success: false,
          statusCode: 400,
          message: '"password" must be a string',
        });
    });

    it('returns success:true if user login is successful', async () => {
      const toSend = deepCopy(mockUsers[0]);
      ddbMock.on(QueryCommand).resolves({
        Items: [toSend]
      });

      const response = await supertest(app)
        .post('/users/login')
        .send({
          userName: 'geo',
          password: 'geoPassword'
        })
        .expect(200);

      assert.deepEqual(response.body.success, true);
      expect(response.body.token).not.to.be.null;
    });

    it('returns appropriate response if dynamo throws error', async () => {
      ddbMock.on(QueryCommand).rejects(mockGenericDynamoError);
  
      const response = await supertest(app)
      .post('/users/login')
        .send({
          userName: 'geo',
          password: 'geoPassword'
        })
        .expect(mockGenericDynamoError.$metadata.httpStatusCode);

      assert.deepEqual(response.body, {
        success: false,
        statusCode: mockGenericDynamoError.$metadata.httpStatusCode,
        message: mockGenericDynamoError.message,
        error: {
          $metadata: mockGenericDynamoError.$metadata
        }
      });
    });
  });
});
