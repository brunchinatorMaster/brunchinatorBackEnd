const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const users = require('../mockDataBase/users');
const { SchemaError } = require('../errors/SchemaError');
const { removePassswordFromArrayOfUsers, removePassswordFromUser } = require('../utils/usersUtils');
const { JWT_SECRET } = require('../utils/utils');
const jwt = require('jsonwebtoken');
const { LoginError } = require('../errors/LoginError');

describe('usersHandler', () => {

  let mockUsersWithoutPasswords;
  beforeEach(() => {
    const mockUsers = JSON.parse(JSON.stringify(users));
    mockUsersWithoutPasswords = removePassswordFromArrayOfUsers(mockUsers);
  });

  describe('getUsers', () => {
    it('returns users', () => {
      const response = usersHandler.getUsers();
      assert.deepEqual(response, mockUsersWithoutPasswords);
    });
  });

  describe('getUserByUserId', () => {
    it('returns only the user that matches userId', () => {
      let response = usersHandler.getUserByUserId('user1');
      
      expect(response).contains(mockUsersWithoutPasswords[0]);
      expect(response).not.contains(mockUsersWithoutPasswords[1]);

      response = usersHandler.getUserByUserId('user2');
      expect(response).not.contains(mockUsersWithoutPasswords[0]);
      expect(response).contains(mockUsersWithoutPasswords[1]);
    });

    it('throws SchemaError is userId is invalid', () => {
      try {
        usersHandler.getUserByUserId(12345);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a string');
        expect(error.originatingRequest).to.equal(12345);
      }
    });
  });

  describe('getUserByUsername', () => {
    it('returns only the user that matches userName', () => {
      let response = usersHandler.getUserByUsername('geo');
      expect(response).contains(mockUsersWithoutPasswords[0]);
      expect(response).not.contains(mockUsersWithoutPasswords[1]);

      response = usersHandler.getUserByUsername('bex');
      expect(response).not.contains(mockUsersWithoutPasswords[0]);
      expect(response).contains(mockUsersWithoutPasswords[1]);
    });

    it('throws SchemaError is userName is invalid', () => {
      try {
        usersHandler.getUserByUsername(12345);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
        expect(error.originatingRequest).to.equal(12345);
      }
    });
  });

  describe('getUserByEmail', () => {
    it('returns only the user that matches email', () => {
      let response = usersHandler.getUserByEmail('tohearstories@gmail.com');
      expect(response).contains(mockUsersWithoutPasswords[0]);
      expect(response).not.contains(mockUsersWithoutPasswords[1]);

      response = usersHandler.getUserByEmail('zombiestyle@gmail.com');
      expect(response).not.contains(mockUsersWithoutPasswords[0]);
      expect(response).contains(mockUsersWithoutPasswords[1]);
    });

    it('throws SchemaError is email is invalid', () => {
      try {
        usersHandler.getUserByEmail('tohearstories@gmail');
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a valid email');
        expect(error.originatingRequest).to.equal('tohearstories@gmail');
      }
    });
  });

  describe('addUser', () => {
    it('adds a user to users', () => {
      const toAdd = {
        email: 'address@domain.com',
        userName: 'some username',
        password: 'somePassword',
      };
      const response = usersHandler.addUser(toAdd);
      assert.deepEqual(response, {
        success: true
      });
    });

    it('throws SchemaError is request is invalid', () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword',
      };
      try {
        usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" is required');
      }
    });
  });

  describe('login', () => {
    it('throws SchemaError if username is not a string', () => {
      const userName = 1;
      const password = 'some string';
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });

    it('throws SchemaError if username is an empty string', () => {
      const userName = '';
      const password = 'some string';
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" cannot be an empty string');
      }
    });

    it('throws SchemaError if password is not a string', () => {
      const userName = 'geo';
      const password = 1;
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"password" must be a string');
      }
    });

    it('throws SchemaError if username is an empty string', () => {
      const userName = 'geo';
      const password = '';
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"password" cannot be an empty string');
      }
    });

    it('throws LoginError error if no user exists with the username', () => {
      const userName = 'not a valid user';
      const password = 'derp';
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(LoginError);
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('No User Found');
      }
    });

    it('throws LoginError error if password is wrong', () => {
      const userName = 'geo';
      const password = 'not a valid password';
      try {
        usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(LoginError);
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Wrong Password');
      }
    });

    it('returns user and jwt token upon successful login', () => {
      const mockUser = JSON.parse(JSON.stringify(users[0]));
      const cleanUser = removePassswordFromUser(mockUser);
      const token = jwt.sign(cleanUser, JWT_SECRET);

      const userName = 'geo';
      const password = 'geoPassword';

      const response = usersHandler.login(userName, password);
      assert.deepEqual(response, {
        user: cleanUser,
        token,
      });
    });
  });
});