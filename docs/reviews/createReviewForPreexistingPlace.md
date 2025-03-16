# Create Review for Existing Place
This document explains the workflow that occurs when a front-end user creates a review for a place that already exists in the system.

## Overview
When a user submits a review, the front-end sends a POST request to the endpoint:

```
POST /api/v1/createReview
```
with a JSON body similar to the following:
```
{
  placeId: String,
  userName: String,
  placeName: String,
  vicinity: String,
  burger: Number | null,
  bloody: Number | null,
  words: String,
  reviewDate: String  // new Date().toLocaleDateString()
}
```
The request is forwarded to the `reviewsHandler.addReview()` method, which handles the review creation process.

## Step-by-Step Workflow
### 1. Input Validation

  `reviewsHandler.addReview()` validates the request body against the `VALIDATE_CREATE_REVIEW_SCHEMA` (defined in `reviewsSchemas.js`).

- Outcome:
  * If validation fails, it returns a BadSchemaResponse.

### 2. Check for Existing Place    

The handler calls `getPlaceByPlaceId()` to check if a place with the provided `placeId` already exists in DynamoDB.

- Error Handling:
  * If there is an error fetching the place, an `AWSErrorResponse` is returned.

- Existing Place Found:
  * In this scenario, the place exists, and the review will be added to update its ratings.

### 3. Update Place and Add Review 
Since the place exists, `reviewsHandler.addReview()` calls `reviewsHandler.updatePlaceAndAddReview()`.

### 4. Recalculate Ratings
Inside `updatePlaceAndAddReview()`, the following steps occur:

- The function calls `recalculateRatingsForAddingReviewToPlace(review, place)`, which:
  * Computes new values for the place's bloody and burger ratings using the helper function `addToAverage`.
  * Calculates the new overall rating using `findAverageOf`
- The `numberOfReviews` property of the place is incremented by one to reflect the addition of the new review.

### 5. Validate Updated Place
The updated place object is validated against `VALIDATE_UPDATE_PLACE_SCHEMA` (from `placesSchemas.js`).

- Outcome:
  * If validation fails, a BadSchemaResponse is returned.

### 6. Assign Unique Review ID and Process Images

- A unique `reviewId` is generated using `uuid` `(v4())`.
- The handler processes any image files by calling `this.handleImagesFiles(review.reviewId, imageFiles)`.
  * Note: The image uploading functionality is handled separately via S3 operations.

### 7. Database Transaction
The handler calls `transactDatabaseAccess.transactionUpdatePlaceAndAddReview(toUpdate, review)` to update the place in DynamoDB with the new ratings and add the review.

- Response Structure:

  The transaction returns an object:
```
{
  success: Boolean,
  DBError: Error | null,
}
```
### 8. Final Response Handling

- If `DBError` is not null, `reviewsHandler.addPlaceAndAddReview()` returns an `AWSErrorResponse`.
- Otherwise, the successful transaction response is returned up the chain:

  `addPlaceAndAddReview()` → `addReview()` → endpoint response.

## Summary
When a new review for a place is created:

- The review is first validated.
- The system checks for an existing place using placeId.
- Finding an existing place, the system recalculates the place’s ratings to include the new review.
- The place's review count is incremented
- The updated place is validated, and a unique review ID is assigned.
- Image files (if provided) are processed and uploaded.
- A database transaction updates the place and adds the review to DynamoDB.
- The final response is returned to the endpoint, either confirming success or returning an appropriate error response.
