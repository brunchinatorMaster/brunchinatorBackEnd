const express = require('express');
const app = express();
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();

app.get('/all', (req, res) => {
	const reviews = reviewsHandler.getReviews();
	res.status(200).json(reviews);
});
app.get('/byReviewId/:reviewId', (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	const toReturn = reviewsHandler.getReviewByReviewId(reviewId);
	res.status(200).json(toReturn);
});

app.get('/byPlaceId/:placeId', (req, res) => {
	const placeId = req.params.placeId ?? null;
	const toReturn = reviewsHandler.getReviewsByPlaceId(placeId);
	res.status(200).json(toReturn);
});

app.get('/byUserId/:userId', (req, res) => {
	const userId = req.params.userId ?? null;
	const toReturn = reviewsHandler.getReviewsByUserId(userId);
	res.status(200).json(toReturn);
});

app.delete('/byReviewId/:reviewId', (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	const toReturn = reviewsHandler.deleteReviewByReviewId(reviewId);
	res.status(200).json(toReturn);
});

app.post('/', (req, res) => {
	const review = req.body;
	const reviews = reviewsHandler.addReview(review);
	res.status(200).json(reviews);
});

module.exports = app;