const { expect, assert } = require('chai');
const { findAverageOf, recalculateRatingsForAddingReviewToPlace, removeFromAverage, recalculateRatingsForRemovingReviewFromPlace, createNewPlaceFromReview } = require('../utils/placesUtils');

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
  it('correctly calculates overall Rating', () => {
    review = {
      placeId: '123',
      placeName: 'some place',
      vicinity: '123 Main St, Philadelphia',
      bloody: 2,
      burger: 3,
    };

    const response = createNewPlaceFromReview(review);

    assert.deepEqual(response, {
      placeId: '123',
      placeName: 'some place',
      vicinity: '123 Main St, Philadelphia',
      bloody: 2,
      burger: 3,
      numberOfReviews: 1,
      overallRating: 2.5,
    });
  });
});

describe('recalculateRatingsForAddingReviewToPlace', () => {
  it('returns toUpdate with correctly calculated individual and overall ratings', () => {
    const review = {
      bloody: 1,
      burger: 1,
    };
    const toUpdate = {
      bloody: 2,
      burger: 2,
      overallRating: 2,
      numberOfReviews: 1,
    }
  
    const response = recalculateRatingsForAddingReviewToPlace(review, toUpdate);
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
        bloody: 2,
        burger: 2.66,
        numberOfReviews: 3
      };
      const review = {
        bloody: 3,
        burger: 2,
      };
      const response = recalculateRatingsForRemovingReviewFromPlace(review, toUpdate);
      expect(response.bloody).to.equal(1.5);
      expect(response.burger).to.equal(2.99);
      expect(response.overallRating).to.equal(2.25);
    });
  });
});