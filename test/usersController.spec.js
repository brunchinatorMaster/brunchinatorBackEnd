const supertest = require('supertest');
const { assert, expect } = require('chai');
const users = require('../mockDataBase/users');

const app = require('../app');


describe('POST /createUser', () => {
  it('returns all users', async () => {
    const mockUsers = JSON.parse(JSON.stringify(users));

    const toSend = {
      email: 'address@domain.com',
      userName: 'some username',
      password: 'somePassword'
    };

    mockUsers.push(toSend);
    const response = await supertest(app)
      .post('/users/createUser')
      .send(toSend)
      .expect(200);
      
    assert.deepEqual(response.body, mockUsers);
  });

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

