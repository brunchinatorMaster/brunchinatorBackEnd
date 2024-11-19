const express = require('express');
const app = express();
const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();

app.get('/byUsername/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	try {
		const toReturn = await usersHandler.getUserByUsername(userName);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/byEmail/:email', async (req, res) => {
	const email = req.params.email ?? null;
	try {
		const toReturn = await usersHandler.getUserByEmail(email);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/updateUser', async (req, res) => {
	const user = req.body;
	try {
		const toReturn = await usersHandler.updateUser(user);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/createUser', async (req, res) => {
	const user = req.body;
	try {
		const toReturn = await usersHandler.addUser(user);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/login', async (req, res) => {
	const userName = req.body?.userName ?? null;
	const password = req.body?.password ?? null;
	try {
		const toReturn = await usersHandler.login(userName, password);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

module.exports = app;