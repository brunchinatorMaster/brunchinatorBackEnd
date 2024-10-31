const { expect, assert } = require('chai');
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();
const mockReviews = require('../mockDataBase/reviews');
const mockPlaces = require('../mockDataBase/places');

describe('reviewsHandler', () => {
  describe('getReviews', () => {
    it('returns reviews', () => {
      const response = reviewsHandler.getReviews();
      assert.deepEqual(response, mockReviews);
    });
  });

  describe('getReviewByReviewId', () => {
    it('returns only the review that matches reviewId', () => {
      let response = reviewsHandler.getReviewByReviewId('review1');
      assert.deepEqual(response, mockReviews[0]);

      response = reviewsHandler.getReviewByReviewId('review2');
      assert.deepEqual(response, mockReviews[1]);
    });

    it('returns null if no review matches reviewId', () => {
      const response = reviewsHandler.getReviewByReviewId('review5');
      expect(response).to.be.null;
    });

    it('returns null if reviewId is null', () => {
      const response = reviewsHandler.getReviewByReviewId();
      expect(response).to.be.null;
    });

    it('returns null if reviewId is not a string', () => {
      let response = reviewsHandler.getReviewByReviewId(1);
      expect(response).to.be.null;

      response = reviewsHandler.getReviewByReviewId(true);
      expect(response).to.be.null;

      response = reviewsHandler.getReviewByReviewId({});
      expect(response).to.be.null;

      response = reviewsHandler.getReviewByReviewId([]);
      expect(response).to.be.null;
    });
  });

  describe('getReviewsByPlaceId', () => {
    it('returns only the review that matches placeId', () => {
      let response = reviewsHandler.getReviewsByPlaceId('place1');
      expect(response).to.have.lengthOf(1);
      assert.deepEqual(response[0], mockReviews[0]);

      response = reviewsHandler.getReviewsByPlaceId('place2');
      expect(response).to.have.lengthOf(2);
      assert.deepEqual(response[0], mockReviews[1]);
      assert.deepEqual(response[1], mockReviews[2]);

      response = reviewsHandler.getReviewsByPlaceId('place3');
      expect(response).to.have.lengthOf(1);
      assert.deepEqual(response[0], mockReviews[3]);
    });

    it('returns empty array if no review matches placeId', () => {
      const response = reviewsHandler.getReviewsByPlaceId('not real');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(mockReviews[0]);
      expect(response).not.contains(mockReviews[1]);
      expect(response).not.contains(mockReviews[2]);
      expect(response).not.contains(mockReviews[3]);
    });

    it('returns empty array if placeId is null', () => {
      const response = reviewsHandler.getReviewsByPlaceId();
      expect(response).to.have.lengthOf(0);
    });

    it('returns empty array if placeId is not a string', () => {
      let response = reviewsHandler.getReviewsByPlaceId(1);
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByPlaceId(true);
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByPlaceId({});
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByPlaceId([]);
      expect(response).to.have.lengthOf(0);
    });
  });

  describe('getReviewsByUserId', () => {
    it('returns only the reviews that matches userId', () => {
      let response = reviewsHandler.getReviewsByUserId('user1');
      expect(response).to.have.lengthOf(2);
      assert.deepEqual(response[0], mockReviews[0]);
      assert.deepEqual(response[1], mockReviews[1]);

      response = reviewsHandler.getReviewsByUserId('user2');
      expect(response).to.have.lengthOf(2);
      assert.deepEqual(response[0], mockReviews[2]);
      assert.deepEqual(response[1], mockReviews[3]);
    });

    it('returns empty array if no review matches userId', () => {
      const response = reviewsHandler.getReviewsByUserId('not real');
      expect(response).to.have.lengthOf(0);
      expect(response).not.contains(mockReviews[0]);
      expect(response).not.contains(mockReviews[1]);
    });

    it('returns empty array if userId is null', () => {
      const response = reviewsHandler.getReviewsByUserId();
      expect(response).to.have.lengthOf(0);
    });

    it('returns empty array if userId is not a string', () => {
      let response = reviewsHandler.getReviewsByUserId(1);
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByUserId(true);
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByUserId({});
      expect(response).to.have.lengthOf(0);

      response = reviewsHandler.getReviewsByUserId([]);
      expect(response).to.have.lengthOf(0);
    });
  });

  describe('deleteReviewByReviewId', () => {
    describe('when deleting a review for a place that has only 1 review', () => {
      it('deletes correct review and deletes place', () => {
        const response = reviewsHandler.deleteReviewByReviewId('review1');
  
        expect(response.reviews).to.have.lengthOf(3);
        assert.deepEqual(response.reviews[0], mockReviews[1]);
        assert.deepEqual(response.reviews[1], mockReviews[2]);
        assert.deepEqual(response.reviews[2], mockReviews[3]);
  
  
        expect(response.places).to.have.lengthOf(2);
        assert.deepEqual(response.places[0], mockPlaces[1]);
        assert.deepEqual(response.places[1], mockPlaces[2]);
      });
    });
    describe('when deleteing a review for a place that has more than 1 review', () => {
      it('deletes correct review and updates place', () => {
        const response = reviewsHandler.deleteReviewByReviewId('review2');

        expect(response.reviews).to.have.lengthOf(3);
        assert.deepEqual(response.reviews[0], mockReviews[0]);
        assert.deepEqual(response.reviews[1], mockReviews[2]);
        assert.deepEqual(response.reviews[2], mockReviews[3]);

        expect(response.places).to.have.lengthOf(3);
        assert.deepEqual(response.places[0], mockPlaces[0]);
        assert.deepEqual(response.places[2], mockPlaces[2]);
        expect(response.places[1].beers).to.equal(3);
        expect(response.places[1].benny).to.equal(2);
        expect(response.places[1].bloody).to.equal(3);
        expect(response.places[1].burger).to.equal(1);
        expect(response.places[1].numberOfReviews).to.equal(1);
      });
    });
    
  });

  describe('addReview', () => {
    describe('when adding a review for a new place', () => {
      it('adds review and adds place', () => {
        const reviewForNewPlace = {
          reviewId: 'review5',
          placeId: 'place4',
          userId: 'user1',
          placeName: 'Royal Tavern',
          beers: 1,
          benny: 1,
          bloody: 1,
          burger: 1,
          reviewDate: '8/21/2018',
          words: 'meh'
        };
        const response = reviewsHandler.addReview(reviewForNewPlace);
        expect(response.reviews).contains(reviewForNewPlace);
  
        expect(response.places[3]).includes({
          placeId: 'place4',
          placeName: 'Royal Tavern',
          beers: 1,
          benny: 1,
          burger: 1,
          bloody: 1,
          numberOfReviews: 1,
          overallRating: 1
        });
      });
    });

    describe('when adding a review for a preexisting place', () => {
      it('adds review and updates place', () => {
        const reviewForPreexistingPlace = {
          reviewId: 'review5',
          placeId: 'place3',
          userId: 'user1',
          placeName: 'White Dog Cafe',
          beers: 1,
          benny: 1,
          bloody: 1,
          burger: 1,
          reviewDate: '8/21/2018',
          words: 'meh'
        };
        
        const response = reviewsHandler.addReview(reviewForPreexistingPlace);
  
        expect(response.reviews).contains(reviewForPreexistingPlace);
  
        expect(response.places[2]).includes({
          placeId: 'place3',
          placeName: 'White Dog Cafe',
          beers: 2,
          benny: 1,
          burger: 3,
          bloody: 2,
          numberOfReviews: 2,
          overallRating: 2
        });
      });
    });
  });

  describe('addReviewForNewPlace', () => {
    it('returns new review and new place', () => {
      const reviewForNewPlace = {
        reviewId: 'review5',
        placeId: 'place4',
        userId: 'user1',
        placeName: 'Royal Tavern',
        beers: 1,
        benny: 1,
        bloody: 1,
        burger: 1,
        reviewDate: '8/21/2018',
        words: 'meh'
      };
      const response = reviewsHandler.addReviewForNewPlace(reviewForNewPlace);
      expect(response.reviews).contains(reviewForNewPlace);

      expect(response.places[3]).includes({
        placeId: 'place4',
        placeName: 'Royal Tavern',
        beers: 1,
        benny: 1,
        burger: 1,
        bloody: 1,
        numberOfReviews: 1,
        overallRating: 1
      });
    });
  });

  describe('addReviewForPreexistingPlace', () => {
    it('returns new review and preexisting place', () => {
      const reviewForPreexistingPlace = {
        reviewId: 'review5',
        placeId: 'place3',
        userId: 'user1',
        placeName: 'White Dog Cafe',
        beers: 1,
        benny: 1,
        bloody: 1,
        burger: 1,
        reviewDate: '8/21/2018',
        words: 'meh'
      };
      const response = reviewsHandler.addReviewForPreexistingPlace(reviewForPreexistingPlace);
      expect(response.reviews).contains(reviewForPreexistingPlace);

      expect(response.places[2]).includes({
        placeId: 'place3',
        placeName: 'White Dog Cafe',
        beers: 2,
        benny: 1,
        burger: 3,
        bloody: 2,
        numberOfReviews: 2,
        overallRating: 2
      });
    });
  });
});