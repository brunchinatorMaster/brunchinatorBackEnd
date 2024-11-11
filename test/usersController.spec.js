const supertest = require('supertest');
const { expect } = require('chai');
const app = require('../app');

describe('POST /createUser', () => {
  it('returns error if request is invalid', async () => {
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
});

describe('POST /updateUser', () => {
  it('returns error if required field is missing', async () => {
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

  it('returns error if field is wrong type', async () => {
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
});

describe('GET /byEmail/:email', () => {
  it('returns error if email is invalid', async () => {
    const response = await supertest(app)
      .get('/users/byEmail/tohearstories@gmail')
      .expect(400);
      
      expect(response.body.reasonForError).to.equal('"value" must be a valid email');
      expect(response.body.originatingRequest).to.equal('tohearstories@gmail');
  });
});

describe('GET /byUsername/:userName', () => {
  it('returns 404 if userName is missing', async () => {
    await supertest(app)
      .get('/users/byUsername/')
      .expect(404);
  });
});
