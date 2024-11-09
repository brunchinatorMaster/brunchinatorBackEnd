const express = require('express');
const app = express();
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();

app.get('/all', async (req, res) => {
	let error;
	try {
		const places = await placesHandler.getPlaces();
		res.status(200).json(places);
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
		const toReturn = await placesHandler.getPlaceByPlaceId(placeId);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

module.exports = app;