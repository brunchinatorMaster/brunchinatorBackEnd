const { expect, assert } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const users = require('../mockDataBase/users');

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
  });
});