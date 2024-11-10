const supertest = require('supertest');
const { assert, expect } = require('chai');
const app = require('../app');

const { removePassswordFromArrayOfUsers } = require('../utils/usersUtils');
const users = require('../mockDataBase/users');
const mockUsers = JSON.parse(JSON.stringify(users));
const mockUsersWithoutPasswords = removePassswordFromArrayOfUsers(mockUsers);

describe('POST /createUser', () => {
  it('returns error if request is invalid', async () => {
    const mockUsers = JSON.parse(JSON.stringify(users));

    const toSend = {
      userName: 'some username',
      password: 'somePassword'
    };

    mockUsers.push(toSend);
    const response = await supertest(app)
      .post('/users/createUser')
      .send(toSend)
      .expect(400);

      expect(response.body.errorInField[0]).to.equal('email');
      expect(response.body.reasonForError).to.equal('"email" is required');
  });
});

describe('GET /byEmail/:email', () => {
  it('returns correct user', async () => {
    const response = await supertest(app)
      .get('/users/byEmail/tohearstories@gmail.com')
      .expect(200);
      
    assert.deepEqual(response.body, mockUsersWithoutPasswords[0]);
  });

  it('returns error if email is invalid', async () => {
    const response = await supertest(app)
      .get('/users/byEmail/tohearstories@gmail')
      .expect(400);
      
      expect(response.body.reasonForError).to.equal('"value" must be a valid email');
      expect(response.body.originatingRequest).to.equal('tohearstories@gmail');
  });
});

describe('GET /byUsername/:userName', () => {
  it('returns correct user', async () => {
    const response = await supertest(app)
      .get('/users/byUsername/geo')
      .expect(200);
      
    assert.deepEqual(response.body, mockUsersWithoutPasswords[0]);
  });

  it('returns 404 if userName is missing', async () => {
    await supertest(app)
      .get('/users/byUsername/')
      .expect(404);
  });
});

describe('GET /byUserId/:userId', () => {
  it('returns correct user', async () => {
    const response = await supertest(app)
      .get('/users/byUserId/user1')
      .expect(200);
      
    assert.deepEqual(response.body, mockUsersWithoutPasswords[0]);
  });

  it('returns 404 if userName is missing', async () => {
    await supertest(app)
      .get('/users/byUserId/')
      .expect(404);
  });
});
