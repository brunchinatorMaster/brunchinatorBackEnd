const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const users = require('../mockDataBase/users');
const { SchemaError } = require('../errors/SchemaError');

describe('usersHandler', () => {
  describe('getUsers', () => {
    it('returns users', () => {
      const response = usersHandler.getUsers();
      assert.deepEqual(response, users);
    });
  });

  describe('getUserByUserId', () => {
    it('returns only the user that matches userId', () => {
      let response = usersHandler.getUserByUserId('user1');
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByUserId('user2');
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
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
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByUsername('bex');
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
    });

    it('throws SchemaError is userName is invalid', () => {
      try {
        usersHandler.getUserByUsername(12345);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a string');
        expect(error.originatingRequest).to.equal(12345);
      }
    });
  });

  describe('getUserByEmail', () => {
    it('returns only the user that matches email', () => {
      let response = usersHandler.getUserByEmail('tohearstories@gmail.com');
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByEmail('zombiestyle@gmail.com');
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
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
      expect(response).to.contain(toAdd);
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
});