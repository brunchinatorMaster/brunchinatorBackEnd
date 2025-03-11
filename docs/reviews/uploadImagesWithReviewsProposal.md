# Proposal for adding Images when creating a Review

03-11-25

## Walk Through
Other than 1 new pass through param in some methods, everything is the same until step 7.

7. `reviewsHandler.addPlaceAndAddReview()` creates a `uuid` for the review.

8. `reviewsHandler.addPlaceAndAddReview()` calls `createFolder() in s3.js` to create a folder with the uuid of the review.

9. `reviewsHandler.addPlaceAndAddReview()` calls a new method `uploadReviewImages()` in s3.js

10. `uploadReviewImages()` uploads the images to s3 and returns an array of urls for the images.

11. `reviewsHandler.addPlaceAndAddReview()` takes that array and adds it to a new field, images, on the review object.

12. `reviewsHandler.addPlaceAndAddReview()` calls `transactDatabaseAccess.transactionAddPlaceAndAddReview()`.

and everything proceeds as before. If there are no images to upload then this entire process is simply skipped.

## New Work
The controller will extract `req.files` using `multer` and pass that array to `reviewsHandler.addReview()` which will pass it through to either `addPlaceAndAddReview` or `updatePlaceAndAddReview`. 

Create a new method in s3.js named `uploadReviewImages()`. It will take the name of the folder and an array of images to upload. The signature should look something like 
```
const uploadReviewImages = async (folderName, images) => {}
```
It will use the `PutObjectCommand` similar to `uploadUserProfileImageToS3` and iteratively upload the images. The return object should be of the following form:

```
{
  success: boolean,
  images: array<string>, // the s3 urls for the images for the front end to display
  S3Error: Error | null
}
```

We will need to do the standard error handling if the `s3 PutObjectCommand` fails. Use `uploadUserProfilePicture` as a model for this.

This will need to be duplicated to the `updatePlaceAndAddReview` method in `reviewsHandler` as well. 

There will be an if check to determine if this is necessary based on if there are images uploaded with the request.