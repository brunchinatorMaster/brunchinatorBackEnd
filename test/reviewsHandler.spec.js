const { expect, assert } = require('chai');
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();
const mockReviews = require('../mockDataBase/reviews');
const mockPlaces = require('../mockDataBase/places');
const { SchemaError } = require('../errors/SchemaError');

describe('reviewsHandler', () => {
  describe('getReviews', () => {
    it('returns reviews', async () => {
      const response = await reviewsHandler.getReviews();
      assert.deepEqual(response, mockReviews);
    });
  });

  describe('getReviewByReviewId', () => {
    it('returns only the review that matches reviewId', async () => {
      let response = await reviewsHandler.getReviewByReviewId('review1');
      assert.deepEqual(response, mockReviews[0]);

      response = await reviewsHandler.getReviewByReviewId('review2');
      assert.deepEqual(response, mockReviews[1]);
    });

    it('returns null if no review matches reviewId', async () => {
      const response = await reviewsHandler.getReviewByReviewId('review5');
      expect(response).to.be.null;
    });

    it('returns null if reviewId is null', async () => {
      const response = await reviewsHandler.getReviewByReviewId();
      expect(response).to.be.null;
    });

    it('returns null if reviewId is not a string', async () => {
      try {
        await reviewsHandler.getReviewByReviewId(1);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a string');
        expect(error.originatingRequest).to.equal(1);
      }
    });
  });

  describe('getReviewsByPlaceId', () => {
    it('returns only the review that matches placeId', async () => {
      let response = await reviewsHandler.getReviewsByPlaceId('place1');
      expect(response).to.have.lengthOf(1);
      assert.deepEqual(response[0], mockReviews[0]);

      response = await reviewsHandler.getReviewsByPlaceId('place2');
      expect(response).to.have.lengthOf(2);
      assert.deepEqual(response[0], mockReviews[1]);
      assert.deepEqual(response[1], mockReviews[2]);

      response = await reviewsHandler.getReviewsByPlaceId('place3');
      expect(response).to.have.lengthOf(1);
      assert.deepEqual(response[0], mockReviews[3]);
    });

    it('returns empty array if no review matches placeId', async () => {
      const response = await reviewsHandler.getReviewsByPlaceId('not real');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(mockReviews[0]);
      expect(response).not.contains(mockReviews[1]);
      expect(response).not.contains(mockReviews[2]);
      expect(response).not.contains(mockReviews[3]);
    });

    it('returns empty array if placeId is null', async () => {
      const response = await reviewsHandler.getReviewsByPlaceId();
      expect(response).to.have.lengthOf(0);
    });

    it('throws SchemaError if placeId is invalid', async () => {
      try {
        await reviewsHandler.getReviewsByPlaceId(1);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"value" must be a string');
        expect(error.originatingRequest).to.equal(1);
      }
    });
  });

  describe('getReviewsByUserName', () => {

    // it('returns empty array if no review matches userName', async () => {
    //   const response = await reviewsHandler.getReviewsByUserName('not real');
    //   expect(response).to.have.lengthOf(0);
    //   expect(response).not.contains(mockReviews[0]);
    //   expect(response).not.contains(mockReviews[1]);
    // });

    // it('returns empty array if userName is null', async () => {
    //   const response = await reviewsHandler.getReviewsByUserName();
    //   expect(response).to.have.lengthOf(0);
    // });

    it('throws SchemaError if userName is invalid', async () => {
      try {
        await reviewsHandler.getReviewsByUserName(1);
      } catch (error) {
        expect(error).to.be.instanceof(SchemaError);
        expect(error.reasonForError).to.equal('"userName" must be a string');
        expect(error.originatingRequest).to.equal(1);
      }
    });
  });

  describe('deleteReviewByReviewId', () => {
    describe('when deleting a review for a place that has only 1 review', () => {
      // it('deletes correct review and deletes place', async () => {
      //   const response = await reviewsHandler.deleteReviewByReviewId('review1');
  
      //   expect(response.reviews).to.have.lengthOf(3);
      //   assert.deepEqual(response.reviews[0], mockReviews[1]);
      //   assert.deepEqual(response.reviews[1], mockReviews[2]);
      //   assert.deepEqual(response.reviews[2], mockReviews[3]);
  
  
      //   expect(response.places).to.have.lengthOf(2);
      //   assert.deepEqual(response.places[0], mockPlaces[1]);
      //   assert.deepEqual(response.places[1], mockPlaces[2]);
      // });
    });
    describe('when deleteing a review for a place that has more than 1 review', () => {
      // it('deletes correct review and updates place', async () => {
      //   const response = await reviewsHandler.deleteReviewByReviewId('review2');

      //   expect(response.reviews).to.have.lengthOf(3);
      //   assert.deepEqual(response.reviews[0], mockReviews[0]);
      //   assert.deepEqual(response.reviews[1], mockReviews[2]);
      //   assert.deepEqual(response.reviews[2], mockReviews[3]);

      //   expect(response.places).to.have.lengthOf(3);
      //   assert.deepEqual(response.places[0], mockPlaces[0]);
      //   assert.deepEqual(response.places[2], mockPlaces[2]);
      //   expect(response.places[1].beers).to.equal(3);
      //   expect(response.places[1].benny).to.equal(2);
      //   expect(response.places[1].bloody).to.equal(3);
      //   expect(response.places[1].burger).to.equal(1);
      //   expect(response.places[1].numberOfReviews).to.equal(1);
      // });
    });
    
  });

  describe('addReview', () => {
    describe('when adding a review for a new place', () => {
      // it('adds review and adds place', async () => {
      //   const reviewForNewPlace = {
      //     reviewId: 'review5',
      //     placeId: 'place4',
      //     userName: 'geo',
      //     placeName: 'Royal Tavern',
      //     beers: 1,
      //     benny: 1,
      //     bloody: 1,
      //     burger: 1,
      //     reviewDate: '8/21/2018',
      //     words: 'meh'
      //   };
      //   const response = await reviewsHandler.addReview(reviewForNewPlace);
      //   expect(response.reviews).contains(reviewForNewPlace);
  
      //   expect(response.places[3]).includes({
      //     placeId: 'place4',
      //     placeName: 'Royal Tavern',
      //     beers: 1,
      //     benny: 1,
      //     burger: 1,
      //     bloody: 1,
      //     numberOfReviews: 1,
      //     overallRating: 1
      //   });
      // });
    });

    describe('when adding a review for a preexisting place', () => {
      // it('adds review and updates place', async () => {
      //   const reviewForPreexistingPlace = {
      //     reviewId: 'review5',
      //     placeId: 'place3',
      //     userName: 'geo',
      //     placeName: 'White Dog Cafe',
      //     beers: 1,
      //     benny: 1,
      //     bloody: 1,
      //     burger: 1,
      //     reviewDate: '8/21/2018',
      //     words: 'meh'
      //   };
        
      //   const response = await reviewsHandler.addReview(reviewForPreexistingPlace);
      //   expect(response.reviews).contains(reviewForPreexistingPlace);
  
      //   expect(response.places[2]).includes({
      //     placeId: 'place3',
      //     placeName: 'White Dog Cafe',
      //     beers: 2,
      //     benny: 1,
      //     burger: 3,
      //     bloody: 2,
      //     numberOfReviews: 2,
      //     overallRating: 2
      //   });
      // });
    });
  });
});