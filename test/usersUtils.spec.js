const { expect, assert } = require('chai');
const sinon = require('sinon');
const nodemailer = require('nodemailer');

const { 
  sanitizeArrayOfUsers,
  sanitizeUser,
  sendResetPasswordEmail,
  sendSignUpEmail
} = require('..//utils/usersUtils');

describe('usersUtils.js', () => {

  describe('sanitizeUser', () => {
    it('removes sensitive fields from a user object', () => {
      const user = { 
        userName: 'testUser', 
        password: 'secret', 
        resetCode: '12345', 
        email: 'test@example.com' 
      };
      const sanitized = sanitizeUser({ ...user });
      assert.notProperty(sanitized, 'password', 'password should be removed');
      assert.notProperty(sanitized, 'resetCode', 'resetCode should be removed');
      assert.property(sanitized, 'userName');
      assert.property(sanitized, 'email');
    });
  });

  describe('sanitizeArrayOfUsers', () => {
    it('sanitizes an array of user objects', () => {
      const users = [
        { userName: 'user1', password: 'secret1', resetCode: '11111', email: 'user1@example.com' },
        { userName: 'user2', password: 'secret2', resetCode: '22222', email: 'user2@example.com' }
      ];
      const sanitizedArray = sanitizeArrayOfUsers(users);
      sanitizedArray.forEach(user => {
        assert.notProperty(user, 'password', 'password should be removed');
        assert.notProperty(user, 'resetCode', 'resetCode should be removed');
        assert.property(user, 'userName');
        assert.property(user, 'email');
      });
    });
  });

  describe('sendResetPasswordEmail', () => {
    let createTransportStub;
    let sendMailStub;
    const fakeUser = {
      email: 'reset@test.com',
      resetCode: '54321'
    };

    beforeEach(() => {
      sendMailStub = sinon.stub().resolves({
        messageId: '123'
      });
      createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailStub
      });
    });

    afterEach(() => {
      createTransportStub.restore();
    });

    it('should send a reset password email successfully', async () => {
      const result = await sendResetPasswordEmail(fakeUser);
      expect(result.success).to.be.true;
      expect(result.response).to.deep.equal({
        messageId: '123'
      });
      expect(result.emailError).to.be.undefined;

      const mailData = sendMailStub.getCall(0).args[0];
      assert.equal(mailData.to, fakeUser.email, 'The email "to" field should match the user email');
      assert.include(mailData.html, fakeUser.resetCode, 'The email body should include the reset code');
      assert.include(mailData.subject, 'Password Reset', 'The subject should mention "Password Reset"');
    });

    it('should return an error if sending email fails', async () => {
      const fakeError = new Error('SMTP error');
      sendMailStub.rejects(fakeError);
      const result = await sendResetPasswordEmail(fakeUser);
      expect(result.success).to.be.false;
      expect(result.response).to.be.undefined;
      expect(result.emailError).to.equal(fakeError);
    });
  });

  describe('sendSignUpEmail', () => {
    let createTransportStub;
    let sendMailStub;
    const fakeUser = {
      email: 'signup@test.com'
    };

    beforeEach(() => {
      sendMailStub = sinon.stub().resolves({
        messageId: '456'
      });
      createTransportStub = sinon.stub(nodemailer, 'createTransport').returns({
        sendMail: sendMailStub
      });
    });

    afterEach(() => {
      createTransportStub.restore();
    });

    it('should send a sign-up email successfully', async () => {
      const result = await sendSignUpEmail(fakeUser);
      expect(result.success).to.be.true;
      expect(result.response).to.deep.equal({
        messageId: '456'
      });
      expect(result.emailError).to.be.undefined;

      const mailData = sendMailStub.getCall(0).args[0];
      assert.equal(mailData.to, fakeUser.email, 'The email "to" field should match the user email');
      assert.include(mailData.subject, 'Welcome', 'The subject should mention "Welcome"');
      assert.include(mailData.html, 'brunchinator.com/signIn', 'The email body should include sign in information');
    });

    it('should return an error if sending sign-up email fails', async () => {
      const fakeError = new Error('SMTP error');
      sendMailStub.rejects(fakeError);
      const result = await sendSignUpEmail(fakeUser);
      expect(result.success).to.be.false;
      expect(result.response).to.be.undefined;
      expect(result.emailError).to.equal(fakeError);
    });
  });
});