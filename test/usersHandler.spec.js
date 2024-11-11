const { expect } = require('chai');
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();
const users = require('../mockDataBase/users');
const { SchemaError } = require('../errors/SchemaError');


describe('usersHandler', () => {

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
  });

  describe('addUser', () => {
    it('throws SchemaError is request is invalid', async () => {
      const toAdd = {
        userName: 'some username',
        password: 'somePassword',
      };
      try {
        await usersHandler.addUser(toAdd);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.errorInField[0]).to.equal('email');
        expect(error.reasonForError).to.equal('"email" is required');
      }
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

    it('throws SchemaError if username is an empty string', async () => {
      const userName = 'geo';
      const password = '';
      try {
        await usersHandler.login(userName, password);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"password" cannot be an empty string');
      }
    });
  });

  describe('deleteUser', () => {
    it('throws SchemaError is userName is invalid', async () => {
      const toDelete = {
        userName: 123
      };
      try {
        await usersHandler.deleteUser(toDelete);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
      }
    });
  });
});