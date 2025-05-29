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

app.get('/api/v1/place-photo-url/:placeId', async (req, res) => {
  const { placeId } = req.params;
  try {
		const toReturn = await placesHandler.getPhotoRef(placeId);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message ?? 'Unknown error' });
	}
});

app.get('/api/v1/photo', async (req, res) => {
  const { photoRef, maxwidth = 600, maxheight = 600 } = req.query;
  try {
		const toReturn = await placesHandler.getPhoto(photoRef, maxwidth, maxheight);
		res.redirect(toReturn);
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: error.message ?? 'Unknown error' });
	}
  
});


module.exports = app;