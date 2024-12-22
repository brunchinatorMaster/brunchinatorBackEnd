const { expect } = require('chai');
const { validateBySchema } = require('../utils/utils');
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
});
