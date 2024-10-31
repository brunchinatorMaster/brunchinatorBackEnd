const { VALIDATE_CREATE_USER_SCHEMA } = require('../schemas/usersSchemas');
const { expect, assert } = require('chai');

describe('VALIDATE_CREATE_USER_SCHEMA', () => {

  it('passes validation if all required fields are valid', () => {
    const toValidate = {
      email: 'address@domain.com',
      userName: 'someuserName',
      password: 'somePassword'
    };
    const { error, value } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
    expect(error).to.be.undefined;
    assert.deepEqual(value, toValidate);
  });

  describe('email', () => {
    it('rejects if email is missing', () => {
      const toValidate = {
        userName: 'someuserName',
        password: 'somePassword'
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"email" is required');
    });

    it('rejects if email is not a valid email', () => {
      const toValidate = {
        email: 'some string',
        userName: 'someuserName',
        password: 'somePassword'
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"email" must be a valid email');
    });
  });
  
  describe('userName', () => {
    it('rejects if userName is missing', () => {
      const toValidate = {
        email: 'address@domain.com',
        password: 'somePassword'
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"userName" is required');
    });

    it('rejects if userName is not a string', () => {
      const toValidate = {
        email: 'address@domain.com',
        userName: 12345,
        password: 'somePassword'
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"userName" must be a string');
    });
  });

  describe('password', () => {
    it('rejects if password is missing', () => {
      const toValidate = {
        email: 'address@domain.com',
        userName: 'some username'
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"password" is required');
    });

    it('rejects if password is not a string', () => {
      const toValidate = {
        email: 'address@domain.com',
        userName: 'some username',
        password: 12345
      };
      const { error } = VALIDATE_CREATE_USER_SCHEMA.validate(toValidate);
      expect(error.details[0].message).to.equal('"password" must be a string');
    });
  });
});
