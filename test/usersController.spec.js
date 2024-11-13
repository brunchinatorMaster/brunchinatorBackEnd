const supertest = require('supertest');
const { expect, assert } = require('chai');
const mockUsers = require('../mockDataBase/users')
const app = require('../app');

const { docClient, QueryCommand, PutCommand, UpdateCommand, ScanCommand } = require('../aws/awsClients');
const { mockClient } = require('aws-sdk-client-mock');
const ddbMock = mockClient(docClient);

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
  
        expect(response.body.errorInField[0]).to.equal('email');
        expect(response.body.reasonForError).to.equal('"email" is required');
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
  
        expect(response.body.errorInField[0]).to.equal('email');
        expect(response.body.reasonForError).to.equal('"email" must be a valid email');
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
  
        expect(response.body.errorInField[0]).to.equal('userName');
        expect(response.body.reasonForError).to.equal('"userName" is a required field');
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
  
        expect(response.body.errorInField[0]).to.equal('userName');
        expect(response.body.reasonForError).to.equal('"userName" must be a string');
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
  
        expect(response.body.errorInField[0]).to.equal('password');
        expect(response.body.reasonForError).to.equal('"password" is a required field');
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
  
        expect(response.body.errorInField[0]).to.equal('password');
        expect(response.body.reasonForError).to.equal('"password" must be a string');
    });

    it('returns success:true if user addition is successful', async () => {
      ddbMock.on(PutCommand).resolves({
        Items: [mockUsers[0]]
      });

      const response = await supertest(app)
        .post('/users/createUser')
        .send(mockUsers[0])
        .expect(200);

      assert.deepEqual(response.body, {success: true});
    });
  });

  describe('POST /updateUser', () => {
    it('returns error if email is missing', async () => {
      const toSend = {
        userName: 'some username',
        password: 'somePassword'
      };
  
      const response = await supertest(app)
        .post('/users/updateUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.errorInField[0]).to.equal('email');
        expect(response.body.reasonForError).to.equal('"email" is required');
    });

    it('returns error if email is not a valid email', async () => {
      const toSend = {
        userName: 'some username',
        password: 'somePassword',
        email: 'address@domain'
      };
  
      const response = await supertest(app)
        .post('/users/updateUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.errorInField[0]).to.equal('email');
        expect(response.body.reasonForError).to.equal('"email" must be a valid email');
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
  
        expect(response.body.errorInField[0]).to.equal('userName');
        expect(response.body.reasonForError).to.equal('"userName" is a required field');
    });

    it('returns error if userName is not a string', async () => {
      const toSend = {
        userName: 123,
        password: 'somePassword',
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/updateUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.errorInField[0]).to.equal('userName');
        expect(response.body.reasonForError).to.equal('"userName" must be a string');
    });

    it('returns error if password is missing', async () => {
      const toSend = {
        userName: 'someName',
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/updateUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.errorInField[0]).to.equal('password');
        expect(response.body.reasonForError).to.equal('"password" is a required field');
    });

    it('returns error if password is not a string', async () => {
      const toSend = {
        userName: 'someName',
        password: 123,
        email: 'address@domain.com'
      };
  
      const response = await supertest(app)
        .post('/users/updateUser')
        .send(toSend)
        .expect(400);
  
        expect(response.body.errorInField[0]).to.equal('password');
        expect(response.body.reasonForError).to.equal('"password" must be a string');
    });

    it('returns success:true if user update is successful', async () => {
      ddbMock.on(UpdateCommand).resolves({
        Items: [mockUsers[0]]
      });

      const response = await supertest(app)
        .post('/users/updateUser')
        .send(mockUsers[0])
        .expect(200);

      assert.deepEqual(response.body, {success: true});
    });
  });

  describe('GET /byEmail/:email', () => {
    it('returns error if email is invalid', async () => {
      const response = await supertest(app)
        .get('/users/byEmail/tohearstories@gmail')
        .expect(400);
        
        expect(response.body.reasonForError).to.equal('"value" must be a valid email');
        expect(response.body.originatingRequest).to.equal('tohearstories@gmail');
    });

    it('returns user found by dynamo', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [mockUsers[0]]
      });
  
      const response = await supertest(app)
        .get('/users/byEmail/tohearstories@gmail.com')
        .expect(200);

        assert.deepEqual(response.body, {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
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
      ddbMock.on(QueryCommand).resolves({
        Items: [mockUsers[0]]
      });
  
      const response = await supertest(app)
        .get('/users/byUsername/geo')
        .expect(200);

        assert.deepEqual(response.body, {
          userName: 'geo',
          email: 'tohearstories@gmail.com'
        });
    });
  });
});




