const express = require('express');
const app = express();
const ReviewsHandler = require('../handlers/reviewsHandler');
const reviewsHandler = new ReviewsHandler();

app.get('/all', async (req, res) => {
	let error;
	try {
		const reviews = await reviewsHandler.getReviews();
		res.status(200).json(reviews);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byReviewId/:reviewId', async (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	let error;
	try {
		const toReturn = await reviewsHandler.getReviewByReviewId(reviewId);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byPlaceId/:placeId', async (req, res) => {
	const placeId = req.params.placeId ?? null;
	let error;
	try {
		const toReturn = await reviewsHandler.getReviewsByPlaceId(placeId);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byUserName/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	let error;
	try {
		const toReturn = await reviewsHandler.getReviewsByUserName(userName);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.delete('/byReviewId/:reviewId', async (req, res) => {
	const reviewId = req.params.reviewId ?? null;
	let error;
	try {
		const toReturn = await reviewsHandler.deleteReviewByReviewId(reviewId);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.post('/', async (req, res) => {
	const review = req.body ?? null;
	let error;
	try {
		const reviews = await reviewsHandler.addReview(review);
		res.status(200).json(reviews);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

module.exports = app;