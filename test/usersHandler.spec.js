const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const mockUsers = require('../mockDataBase/users');
const { SchemaError } = require('../errors/SchemaError');

const { docClient, QueryCommand, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);


describe('usersHandler', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('getUserByUsername', () => {
    it('throws SchemaError is userName is invalid', async () => {
      try {
        await usersHandler.getUserByUsername(12345);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
        expect(error.originatingRequest).to.equal(12345);
      }
    });

    it('returns user found by dynamo', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [mockUsers[0]]
      });
  
      const response = await usersHandler.getUserByUsername('geo');

      assert.deepEqual(response, {
        userExists: true,
        user: {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        }
      });
    });
  });

  describe('getUserByEmail', () => {
    it('throws SchemaError is email is invalid', async () => {
      try {
        await usersHandler.getUserByEmail('tohearstories@gmail');
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a valid email');
        expect(error.originatingRequest).to.equal('tohearstories@gmail');
      }
    });

    it('returns user found by dynamo', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [mockUsers[0]]
      });
  
      const response = await usersHandler.getUserByEmail('tohearstories@gmail.com');

      assert.deepEqual(response, {
        userExists: true,
        user: {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        }
      });
    });
  });

  describe('addUser', () => {
    it('throws SchemaError if email is missing', async () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" is required');
      }
    });

    it('throws SchemaError if email is not a valid email', async () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword',
        email: 'tohearstories@gmail'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" must be a valid email');
      }
    });

    it('throws SchemaError if userName is missing', async () => {
      const toAdd = {
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('userName');
        expect(error.reasonForError).to.equal('"userName" is a required field');
      }
    });

    it('throws SchemaError if userName is not a string', async () => {
      const toAdd = {
        userName: 123,
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('userName');
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });

    it('throws SchemaError if password is missing', async () => {
      const toAdd = {
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('password');
        expect(error.reasonForError).to.equal('"password" is a required field');
      }
    });

    it('throws SchemaError if password is not a string', async () => {
      const toAdd = {
        userName: 'someName',
        password: 123,
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('password');
        expect(error.reasonForError).to.equal('"password" must be a string');
      }
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
    it('throws SchemaError if email is missing', async () => {
      const toUpdate = {
        userName: 'some username',
        password: 'somePassword'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" is required');
      }
    });

    it('throws SchemaError if email is not a valid email', async () => {
      const toUpdate = {
        userName: 'some username',
        password: 'somePassword',
        email: 'tohearstories@gmail'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" must be a valid email');
      }
    });

    it('throws SchemaError if userName is missing', async () => {
      const toUpdate = {
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('userName');
        expect(error.reasonForError).to.equal('"userName" is a required field');
      }
    });

    it('throws SchemaError if userName is not a string', async () => {
      const toUpdate = {
        userName: 123,
        password: 'somePassword',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('userName');
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });

    it('throws SchemaError if password is missing', async () => {
      const toUpdate = {
        userName: 'someName',
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('password');
        expect(error.reasonForError).to.equal('"password" is a required field');
      }
    });

    it('throws SchemaError if password is not a string', async () => {
      const toUpdate = {
        userName: 'someName',
        password: 123,
        email: 'tohearstories@gmail.com'
      };
      try {
        await usersHandler.updateUser(toUpdate);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('password');
        expect(error.reasonForError).to.equal('"password" must be a string');
      }
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
    it('throws SchemaError if username is not a string', async () => {
      const userName = 1;
      const password = 'some string';
      try {
        await usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });

    it('throws SchemaError if username is an empty string', async () => {
      const userName = '';
      const password = 'some string';
      try {
        await usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" cannot be an empty string');
      }
    });

    it('throws SchemaError if password is not a string', async () => {
      const userName = 'geo';
      const password = 1;
      try {
        await usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"password" must be a string');
      }
    });

    it('throws SchemaError if password is an empty string', async () => {
      const userName = 'geo';
      const password = '';
      try {
        await usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"password" cannot be an empty string');
      }
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
    it('throws SchemaError is userName is missing', async () => {
      try {
        await usersHandler.deleteUser();
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });

    it('throws SchemaError is userName is not a string', async () => {
      try {
        await usersHandler.deleteUser(123);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
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