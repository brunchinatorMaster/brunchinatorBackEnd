const { expect, assert } = require('chai');
const { findAverageOf, recalculateRatingsForAddingReviewToPlace, removeFromAverage, recalculateRatingsForRemovingReviewFromPlace } = require('../utils/placesUtils');

describe('findAverageOf', () => {
  it('calculates average', () => {
    expect(findAverageOf([1,2,3])).equals(2);
    expect(findAverageOf([1,1,2,3])).equals(1.75);
  });
  it('ignores nulls', () => {
    expect(findAverageOf([1,null,2,3])).equals(2);
  });
});

describe('createNewPlaceFromReview', () => {
  // it('correctly calculates overall Rating', () => {
  //   review = {
  //     placeId: '123',
  //     placeName: 'some place',
  //     beers: 1,
  //     bloody: 2,
  //     burger: 3,
  //     benny: null,
  //   };

  //   const response = createNewPlaceFromReview(review);

  //   assert.deepEqual(response, {
  //     placeId: '123',
  //     placeName: 'some place',
  //     beers: 1,
  //     bloody: 2,
  //     burger: 3,
  //     benny: null,
  //     numberOfReviews: 1,
  //     overallRating: 2,
  //   });
  // });
});

describe('recalculateRatingsForAddingReviewToPlace', () => {
  it('returns toUpdate with correctly calculated individual and overall ratings', () => {
    const review = {
      beers: 1,
      benny: 1,
      bloody: 1,
      burger: 1,
    };
    const toUpdate = {
      beers: 2,
      benny: 2,
      bloody: 2,
      burger: 2,
      overallRating: 2
    }
  
    const response = recalculateRatingsForAddingReviewToPlace(review, toUpdate);
    expect(response.beers).to.equal(1.5);
    expect(response.benny).to.equal(1.5);
    expect(response.bloody).to.equal(1.5);
    expect(response.burger).to.equal(1.5);
    expect(response.overallRating).to.equal(1.5);
  });
});

describe('removeFromAverage', () => {
  it('correctly recalculates average after an element is removed', () => {
    // originalArray = [7,3,8,2];
    const elementToRemove = 7;
    const originalAverage = 5;
    const originalNumberOfElements = 4;
    
    const response = removeFromAverage(elementToRemove, originalAverage, originalNumberOfElements);
    expect(response).to.equal(4.33)
  });
  it('correctly recalculates average after an element is removed for an array of size 2', () => {
    // originalArray = [7,3];
    const elementToRemove = 7;
    const originalAverage = 5;
    const originalNumberOfElements = 2;
    
    const response = removeFromAverage(elementToRemove, originalAverage, originalNumberOfElements);
    expect(response).to.equal(3)
  });

  describe('recalculateRatingsForRemovingReviewFromPlace', () => {
    it('returns correctly updated place', () => {
      const toUpdate = {
        beers: 4.66,
        benny: 3,
        bloody: 2,
        burger: 2.66,
        numberOfReviews: 3
      };
      const review = {
        beers: 5,
        benny: 2,
        bloody: 3,
        burger: 2,
      };
      const response = recalculateRatingsForRemovingReviewFromPlace(review, toUpdate);
      expect(response.beers).to.equal(4.49);
      expect(response.benny).to.equal(3.5);
      expect(response.bloody).to.equal(1.5);
      expect(response.burger).to.equal(2.99);
      expect(response.overallRating).to.equal(3.12);
    });
  });
});