const { expect, assert } = require('chai');
const { 
  findAverageOf,
  removeFromAverage,
  addToAverage,
  updateAverage,
  createNewPlaceFromReview,
  recalculateRatingsForAddingReviewToPlace,
  recalculateRatingsForRemovingReviewFromPlace,
  recalculateRatingsForUpdatingReviewOnPlace,
} = require('../utils/placesUtils');

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

describe('addToAverage', () => {
  it('should calculate a new average when a new element is added', () => {
    // ((4 * 2) + 6) / 3 = (8 + 6) / 3 = 14/3 ≈ 4.67
    const newAvg = addToAverage(4, 2, 6);
    assert.closeTo(newAvg, 4.67, 0.01);
  });

  it('should return the original average if any input is invalid', () => {
    // if elementToAdd is not a number
    const newAvg = addToAverage(4, 2, '6');
    assert.equal(newAvg, 4);
  });
});

describe('updateAverage', () => {
  it('should update the average correctly when replacing a value', () => {
    // ((5*3) - 5 + 7) / 3 = (15 - 5 + 7) / 3 = 17/3 ≈ 5.67
    const newAvg = updateAverage(5, 3, 5, 7);
    assert.closeTo(newAvg, 5.67, 0.01);
  });

  it('should return the original average if any input is invalid', () => {
    const newAvg = updateAverage(5, 3, 5, '7');
    assert.equal(newAvg, 5);
  });
});

describe('recalculateRatingsForUpdatingReviewOnPlace', () => {
  it('should recalculate ratings correctly when updating a review', () => {
    const oldReview = { bloody: 5, burger: 5 };
    const newReview = { bloody: 3, burger: 7 };
    const toUpdate = { bloody: 5, burger: 5, numberOfReviews: 3, overallRating: 5 };
    // newBloody = updateAverage(5,3,5,3) = ((5*3-5+3)/3)= (15-5+3)/3 = 13/3 ≈ 4.33
    // newBurger = updateAverage(5,3,5,7) = ((5*3-5+7)/3)= (15-5+7)/3 = 17/3 ≈ 5.67
    // overallRating = average(4.33, 5.67) = (4.33+5.67)/2 = 5.00
    const updatedPlace = recalculateRatingsForUpdatingReviewOnPlace(oldReview, newReview, toUpdate);
    assert.closeTo(updatedPlace.bloody, 4.33, 0.01);
    assert.closeTo(updatedPlace.burger, 5.67, 0.01);
    assert.closeTo(updatedPlace.overallRating, 5.00, 0.01);
  });
});