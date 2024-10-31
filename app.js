// const  { PORT = 3000} = process.env;

const express = require('express');
const app = express();

const reviewsController = require('./controllers/reviewsController');
const usersController = require('./controllers/usersController');
const placesController = require('./controllers/placesController');

app.use(express.json());
app.use('/reviews', reviewsController);
app.use('/users', usersController);
app.use('/places', placesController);

app.get('/', (req, res)=>{
	res.send('Hello, World!!');
});

// app.listen(PORT, () => {
// 	console.log(`listening on port ${PORT}`);
// });

module.exports = app;