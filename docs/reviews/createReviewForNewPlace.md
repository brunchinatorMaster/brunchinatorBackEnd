# Create Review for New Place
This document explains the workflow that occurs when a front-end user creates a review for a new place.

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
  * If there is an error fetching the place, an AWSErrorResponse is returned.

- Assumption for New Review:
  * In this scenario, no matching place is found, meaning the user is reviewing this place for the first time.
### 3. Add Review for a New Place
Since the place does not exist, `reviewsHandler.addReview()` calls `reviewsHandler.addPlaceAndAddReview()`.

### 4. Create a New Place
Inside `addPlaceAndAddReview()`, the method calls `placesUtils.createNewPlaceFromReview(review)`-.

- Functionality:
  * This function extracts relevant properties from the review and creates a new place object.
  * The new place is initialized with one review.
  * The overall rating is calculated using the `findAverageOf` helper.

### 5. Validate New Place
The newly created place object is validated against `VALIDATE_CREATE_PLACE_SCHEMA` (from `placesSchemas.js`).

- Outcome:
  * If validation fails, a BadSchemaResponse is returned.

### 6. Assign Unique Review ID and Process Images

- A unique `reviewId` is generated using `uuid` `(v4())`.
- The handler processes any image files by calling `this.handleImagesFiles(review.reviewId, imageFiles)`.
  * Note: The image uploading functionality is handled separately via S3 operations.

### 7. Database Transaction
The handler calls `transactDatabaseAccess.transactionAddPlaceAndAddReview(place, review)` to insert the new place and review into DynamoDB.

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
- If no place exists, a new place is created from the review.
- The new place is validated, and a unique review ID is assigned.
- Image files (if provided) are processed and uploaded.
- A database transaction adds both the new place and the review to DynamoDB.
- The final response is returned to the endpoint, either confirming success or returning an appropriate error response.
