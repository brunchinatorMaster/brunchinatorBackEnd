const express = require('express');
const app = express();
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();

app.get('/all', (req, res, next) => {
	const users = usersHandler.getUsers();
	res.status(200).json(users);
});

app.get('/byUserId/:userId', (req, res) => {
	const userId = req.params.userId ?? null;
	const toReturn = usersHandler.getUserByUserId(userId);
	res.status(200).json(toReturn);
});

app.get('/byUsername/:userName', (req, res) => {
	const userName = req.params.userName ?? null;
	const toReturn = usersHandler.getUserByUsername(userName);
	res.status(200).json(toReturn);
});

app.get('/byEmail/:email', (req, res) => {
	const email = req.params.email ?? null;
	const toReturn = usersHandler.getUserByEmail(email);
	res.status(200).json(toReturn);
});

app.post('/createUser', (req, res) => {
	const user = req.body;
	const response = usersHandler.addUser(user);
	res.status(200).json(response);
});

module.exports = app;