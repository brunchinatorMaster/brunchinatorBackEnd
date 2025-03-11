# Create Review For New Place

## Walk Through
The front end calls the endpoint `POST /api/v1/createReview` in `reviewsController` with a body of the following form:

```
{
  placeId: string,
  userName: string,
  placeName: string,
  vicinity: string,
  burger: number | null,
  bloody: number | null,
  words: string,
  reviewDate: string, // new Date().toLocaleDateString()
}
```
`reviewsController` forwards the request to `reviewsHandler.addReview()`.

1. `reviewsHandler.addReview()` checks the request body against `VALIDATE_CREATE_REVIEW_SCHEMA` located in `reviewsSchemas.js` and return an instance of `BadSchemaResponse` if there is a problem.

2. `reviewsHandler.addReview()` calls `getPlaceByPlaceId()` to determine if there is already a place in `Dynamo` which matches the `placeId`. If there is any error fetching the place from `Dynamo` we return an instance of `AWSErrorResponse`. For purposes of this document there is no place found so the user is reviewing this place for the first time.

3. `reviewsHandler.addReview()` calls `reviewsHandler.addPlaceAndAddReview`.

4. `reviewsHandler.addPlaceAndAddReview` calls `placesUtils.createNewPlaceFromReview`.

5. `placesUtils.createNewPlaceFromReview` creates an instance of place from the review and returns it to `reviewsHandler.addPlaceAndAddReview`.

6. `reviewsHandler.addPlaceAndAddReview` checks the place against `VALIDATE_CREATE_PLACE_SCHEMA` located in `placesSchemas.js` and return an instance of `BadSchemaResponse` if there is a problem. 

7. `reviewsHandler.addPlaceAndAddReview()` creates a `uuid` for the review and calls `transactDatabaseAccess.transactionAddPlaceAndAddReview()`.

8. `transactDatabaseAccess.transactionAddPlaceAndAddReview()` `PUTS` the place and review in `Dynamo` and returns an object of the following form:

```
{
  success: boolean,
  DBError: Error | null,
}
```
9.  `reviewsHandler.addPlaceAndAddReview()` returns the same object to `reviewsHandler.addReview()`.
10. `reviewsHandler.addReview()` returns an instance of `AWSErrorResponse` if DBError is not null. If DBError is null then `reviewsHandler.addReview()` returns the response to the endpoint.