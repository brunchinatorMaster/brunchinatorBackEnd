const { expect, assert } = require('chai');
const { validateBySchema, deepCopy } = require('../utils/utils');
const { VALIDATE_CREATE_REVIEW_SCHEMA } = require('../schemas/reviewsSchemas');

describe('utils.js', () => {
  describe('validateBySchema', () => {
    describe('VALIDATE_CREATE_REVIEW_SCHEMA', () => {
      it('allows burger to be null', async () => {
        const review = {
          placeId:'123',
          placeName: 'some place',
          userName: 'geo',
          bloody: 2,
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.true;
      });

      it('allows bloody to be null', async () => {
        const review = {
          placeId:'123',
          placeName: 'some place',
          userName: 'geo',
          burger: 2,
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.true;
      });

      it('allows words to be null', async () => {
        const review = {
          placeId:'123',
          placeName: 'some place',
          userName: 'geo',
          burger: 2,
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.true;
      });

      it('allows words to be an empty string', async () => {
        const review = {
          placeId:'123',
          placeName: 'some place',
          userName: 'geo',
          burger: 2,
          bloody: 1,
          words: '',
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.true;
      });

      it('rejects if userName is missing', async () => {
        const review = {
          placeId:'123',
          placeName: 'some place',
          burger: 2,
          bloody: 1,
          words: 'some words',
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.false;
      });

      it('rejects if placeId is missing', async () => {
        const review = {
          placeName: 'some place',
          userName: 'geo',
          burger: 2,
          bloody: 1,
          words: 'some words',
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.false;
      });

      it('rejects if placeName is missing', async () => {
        const review = {
          placeId: '123',
          userName: 'geo',
          burger: 2,
          bloody: 1,
          words: 'some words',
          reviewDate: '12/22/2024',
        }
        const reviewSchemaResponse = validateBySchema(review, VALIDATE_CREATE_REVIEW_SCHEMA);
        expect(reviewSchemaResponse.isValid).to.be.false;
      });
    });
  });

  describe('deepCopy', () => {
    it('returns a deep copy of a simple object', () => {
      const original = { a: 1, b: 2 };
      const copy = deepCopy(original);
      assert.deepEqual(copy, original, 'The copied object should equal the original object');
      // Modify copy and check original remains unchanged
      copy.a = 42;
      assert.notEqual(copy.a, original.a, 'Modifying the copy should not affect the original object');
    });
  
    it('returns a deep copy of a nested object', () => {
      const original = { a: 1, b: { c: 2, d: { e: 3 } } };
      const copy = deepCopy(original);
      assert.deepEqual(copy, original, 'The copied nested object should equal the original nested object');
      // Modify nested property in copy
      copy.b.d.e = 99;
      assert.notEqual(copy.b.d.e, original.b.d.e, 'Modifying the nested property in the copy should not affect the original');
    });
  
    it('returns a deep copy of an array of objects', () => {
      const original = [{ a: 1 }, { b: 2 }];
      const copy = deepCopy(original);
      assert.deepEqual(copy, original, 'The copied array should equal the original array');
      // Modify an element in the copied array
      copy[0].a = 42;
      assert.notEqual(copy[0].a, original[0].a, 'Modifying an element in the copy should not affect the original array');
    });
  
    it('correctly copies primitive values', () => {
      // For primitives, deepCopy returns the same value.
      const num = 123;
      const str = 'hello';
      const bool = true;
  
      assert.equal(deepCopy(num), num, 'A number should be returned as is');
      assert.equal(deepCopy(str), str, 'A string should be returned as is');
      assert.equal(deepCopy(bool), bool, 'A boolean should be returned as is');
    });
  
    it('omits functions from the copied object', () => {
      const original = { a: 1, fn: () => 'test' };
      const copy = deepCopy(original);
      // JSON.stringify omits functions, so the copied object should not have the "fn" property.
      assert.notProperty(copy, 'fn', 'The copied object should not include function properties');
    });
  
    it('returns null if the input is null', () => {
      const input = null;
      const copy = deepCopy(input);
      assert.equal(copy, null, 'Deep copy of null returns null');
    });
  
    it('returns undefined if the input is undefined', () => {
      const input = undefined;
      const copy = deepCopy(input);
      assert.equal(copy, undefined, 'Deep copy of undefined returns undefined');
    });
  
    it('handles an empty object correctly', () => {
      const original = {};
      const copy = deepCopy(original);
      assert.deepEqual(copy, original, 'Copy of an empty object should be an empty object');
    });
  
    it('handles an empty array correctly', () => {
      const original = [];
      const copy = deepCopy(original);
      assert.deepEqual(copy, original, 'Copy of an empty array should be an empty array');
    });
  });
});
