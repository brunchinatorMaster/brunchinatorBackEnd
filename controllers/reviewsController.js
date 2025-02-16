const express = require('express');
const app = express();
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();

app.get('/api/v1/all', async (req, res) => {
	try {
		const toReturn = await reviewsHandler.getReviews();
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v1/byReviewId/:reviewId', async (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	try {
		const toReturn = await reviewsHandler.getReviewByReviewId(reviewId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v1/byPlaceId/:placeId', async (req, res) => {
	const placeId = req.params.placeId ?? null;
	try {
		const toReturn = await reviewsHandler.getReviewsByPlaceId(placeId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v1/byUserName/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	try {
		const toReturn = await reviewsHandler.getReviewsByUserName(userName);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.delete('/api/v1/byReviewId/:reviewId', async (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	try {
		const toReturn = await reviewsHandler.deleteReviewByReviewId(reviewId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/createReview', async (req, res) => {
	const review = req.body ?? null;
	try {
		const toReturn = await reviewsHandler.addReview(review);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/updateReview', async (req, res) => {
	const review = req.body ?? null;
	try {
		const toReturn = await reviewsHandler.updateReview(review);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v2/imagesCount/:reviewId', async (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	try {
		const toReturn = await reviewsHandler.getImagesCountForReview(reviewId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
})

module.exports = app;