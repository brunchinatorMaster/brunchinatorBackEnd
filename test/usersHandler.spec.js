const { expect } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const users = require('../mockDataBase/users');

describe('usersHandler', () => {
  describe('getUsers', () => {
    it('returns users', () => {
      const response = usersHandler.getUsers();
      expect(response).contains(...users);
    });
  });

  describe('getUserByUserId', () => {
    it('returns only the user that matches userId', () => {
      let response = usersHandler.getUserByUserId('user1');
      expect(response).to.have.lengthOf(1);
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByUserId('user2');
      expect(response).to.have.lengthOf(1);
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
    });

    it('returns empty array if no user matches userId', () => {
      const response = usersHandler.getUserByUserId('user3');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(users[0]);
      expect(response).not.contains(users[1]);
    });

    it('returns empty array if userId is null', () => {
      const response = usersHandler.getUserByUserId();
      expect(response).to.have.lengthOf(0);
    });

    it('returns empty array if userId is not a string', () => {
      let response = usersHandler.getUserByUserId(1);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUserId(true);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUserId({});
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUserId([]);
      expect(response).to.have.lengthOf(0);
    });
  });

  describe('getUserByUsername', () => {
    it('returns only the user that matches userName', () => {
      let response = usersHandler.getUserByUsername('geo');
      expect(response).to.have.lengthOf(1);
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByUsername('bex');
      expect(response).to.have.lengthOf(1);
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
    });

    it('returns empty array if no user matches userId', () => {
      const response = usersHandler.getUserByUsername('not real');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(users[0]);
      expect(response).not.contains(users[1]);
    });

    it('returns empty array if userId is null', () => {
      const response = usersHandler.getUserByUsername();
      expect(response).to.have.lengthOf(0);
    });

    it('returns empty array if userId is not a string', () => {
      let response = usersHandler.getUserByUsername(1);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUsername(true);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUsername({});
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByUsername([]);
      expect(response).to.have.lengthOf(0);
    });
  });

  describe('getUserByEmail', () => {
    it('returns only the user that matches email', () => {
      let response = usersHandler.getUserByEmail('tohearstories@gmail.com');
      expect(response).to.have.lengthOf(1);
      expect(response).contains(users[0]);
      expect(response).not.contains(users[1]);

      response = usersHandler.getUserByEmail('zombiestyle@gmail.com');
      expect(response).to.have.lengthOf(1);
      expect(response).not.contains(users[0]);
      expect(response).contains(users[1]);
    });

    it('returns empty array if no user matches userId', () => {
      const response = usersHandler.getUserByEmail('not real');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(users[0]);
      expect(response).not.contains(users[1]);
    });

    it('returns empty array if userId is null', () => {
      const response = usersHandler.getUserByEmail();
      expect(response).to.have.lengthOf(0);
    });

    it('returns empty array if userId is not a string', () => {
      let response = usersHandler.getUserByEmail(1);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByEmail(true);
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByEmail({});
      expect(response).to.have.lengthOf(0);

      response = usersHandler.getUserByEmail([]);
      expect(response).to.have.lengthOf(0);
    });
  });
})