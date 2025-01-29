const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const reviewsController = require('./controllers/reviewsController');
const usersController = require('./controllers/usersController');
const placesController = require('./controllers/placesController');

app.use(express.json());
app.use('/brunchinatorBackend/reviews', reviewsController);
app.use('/brunchinatorBackend/users', usersController);
app.use('/brunchinatorBackend/places', placesController);

app.get('/brunchinatorBackend/', (req, res)=>{
	res.send('Hello, Brunch!');
});

module.exports = app;