const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const mockUsers = require('../mockDataBase/users');
const { SchemaError } = require('../errors/SchemaError');

const { docClient, QueryCommand, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const ddbMock = mockClient(docClient);


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
      ddbMock.on(QueryCommand).resolves({
        Items: [mockUsers[0]]
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
      ddbMock.on(ScanCommand).resolves({
        Items: [mockUsers[0]]
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
  });

  describe('addUser', () => {
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

    it('returns success:true if user addition is successful', async () => {
      ddbMock.on(PutCommand).resolves({
        Items: [mockUsers[0]]
      });

      const toAdd = {
        userName: 'someName',
        password: 'password',
        email: 'tohearstories@gmail.com'
      };

      const response = await usersHandler.addUser(toAdd);

      assert.deepEqual(response, {
        success: true,
        DBError: undefined
      });
    });
  });

  describe('updateUser', () => {
    it('returns BadSchemaResponse if email is missing', async () => {
      const toUpdate = {
        userName: 'some username',
        password: 'somePassword'
      };
      
      const response = await usersHandler.updateUser(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"email" is required');
    });

    it('returns BadSchemaResponse if email is not a valid email', async () => {
      const toUpdate = {
        userName: 'some username',
        password: 'somePassword',
        email: 'tohearstories@gmail'
      };
      
      const response = await usersHandler.updateUser(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"email" must be a valid email');
    });

    it('returns BadSchemaResponse if userName is missing', async () => {
      const toUpdate = {
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUser(toUpdate);

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
      
      const response = await usersHandler.updateUser(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"userName" must be a string');
    });

    it('returns BadSchemaResponse if password is missing', async () => {
      const toUpdate = {
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      };
      
      const response = await usersHandler.updateUser(toUpdate);

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
      
      const response = await usersHandler.updateUser(toUpdate);

      expect(response).to.be.instanceof(BadSchemaResponse);
      expect(response.success).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('"password" must be a string');
    });

    it('returns success:true if user update is successful', async () => {
      ddbMock.on(UpdateCommand).resolves({
        Attributes: mockUsers[0]
      });

      const toUpdate = {
        userName: 'someName',
        password: 'password',
        email: 'tohearstories@gmail.com'
      };

      const response = await usersHandler.updateUser(toUpdate);

      assert.deepEqual(response, {
        success: true,
        updatedUser: {
          email: 'tohearstories@gmail.com',
          userName: 'geo'
        },
        DBError: undefined
      });
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

      const response = await usersHandler.login('geo', 'geoPassword');
      assert.deepEqual(response.user, {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
      });
      expect(response.token).to.be.not.null;
    })
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
  });
});