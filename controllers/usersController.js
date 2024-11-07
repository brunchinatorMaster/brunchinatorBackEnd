const express = require('express');
const app = express();
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();

app.get('/all', (req, res, next) => {
	let error;
	try {
		const users = usersHandler.getUsers();
		res.status(200).json(users);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byUserId/:userId', (req, res) => {
	const userId = req.params.userId ?? null;
	let error;
	try {
		const toReturn = usersHandler.getUserByUserId(userId);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byUsername/:userName', (req, res) => {
	const userName = req.params.userName ?? null;
	let error;
	try {
		const toReturn = usersHandler.getUserByUsername(userName);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byEmail/:email', (req, res) => {
	const email = req.params.email ?? null;
	let error;
	try {
		const toReturn = usersHandler.getUserByEmail(email);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
	
});

app.post('/createUser', (req, res) => {
	const user = req.body;
	let error;
	try {
		const response = usersHandler.addUser(user);
		res.status(200).json(response);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.post('/login', (req, res) => {
	const userName = req.body?.userName ?? null;
	const password = req.body?.password ?? null;
	let error;
	try {
		const response = usersHandler.login(userName, password);
		res.status(200).json(response);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}

});

module.exports = app;