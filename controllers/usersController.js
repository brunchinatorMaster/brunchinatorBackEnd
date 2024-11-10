const express = require('express');
const app = express();
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();

app.get('/all', async (req, res, next) => {
	let error;
	try {
		const users = await usersHandler.getUsers();
		res.status(200).json(users);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byUsername/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	let error;
	try {
		const toReturn = await usersHandler.getUserByUsername(userName);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.get('/byEmail/:email', async (req, res) => {
	const email = req.params.email ?? null;
	let error;
	try {
		const toReturn = await usersHandler.getUserByEmail(email);
		res.status(200).json(toReturn);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
	
});

app.post('/createUser', async (req, res) => {
	const user = req.body;
	let error;
	try {
		const response = await usersHandler.addUser(user);
		res.status(200).json(response);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}
});

app.post('/login', async (req, res) => {
	const userName = req.body?.userName ?? null;
	const password = req.body?.password ?? null;
	let error;
	try {
		const response = await usersHandler.login(userName, password);
		res.status(200).json(response);
	} catch (err) {
		error = err;
	} finally {
		res.status(400).json(error);
	}

});

module.exports = app;