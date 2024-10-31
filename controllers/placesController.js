const express = require('express');
const app = express();
const PlacesHandler = require('../handlers/placesHandler');
const placesHandler = new PlacesHandler();

app.get('/all', (req, res) => {
	const places = placesHandler.getPlaces();
	res.status(200).json(places);
});

app.get('/byPlaceId/:placeId', (req, res) => {
	const placeId = req.params.placeId ?? null;
	const toReturn = placesHandler.getPlaceByPlaceId(placeId);
	res.status(200).json(toReturn);
});

module.exports = app;