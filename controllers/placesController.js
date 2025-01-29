const express = require('express');
const app = express();
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();

app.get('/api/v1/all', async (req, res) => {
	try {
		const toReturn = await placesHandler.getPlaces();
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v1/byPlaceId/:placeId', async (req, res) => {
	const placeId = req.params.placeId ?? null;
	try {
		const toReturn = await placesHandler.getPlaceByPlaceId(placeId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

module.exports = app;