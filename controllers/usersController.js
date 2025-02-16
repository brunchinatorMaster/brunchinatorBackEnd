const express = require('express');
const app = express();

const multer = require('multer');

const UsersHandler = require('../handlers/usersHandler');
const usersHandler = new UsersHandler();

app.get('/api/v1/byUsername/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	try {
		const toReturn = await usersHandler.getUserByUsername(userName);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.get('/api/v1/byEmail/:email', async (req, res) => {
	const email = req.params.email ?? null;
	try {
		const toReturn = await usersHandler.getUserByEmail(email);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/updateUserPassword', async (req, res) => {
	const user = req.body;
	try {
		const toReturn = await usersHandler.updateUserPassword(user);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/createUser', async (req, res) => {
	const user = req.body;
	try {
		const toReturn = await usersHandler.addUser(user);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/login', async (req, res) => {
	const userName = req.body?.userName ?? null;
	const password = req.body?.password ?? null;
	try {
		const toReturn = await usersHandler.login(userName, password);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/userProfilePicture', multer().any(), async (req, res) => {
	const key = req.body?.userName ?? 'test'
	try {
		const file = req.files[0];
		const toReturn = await usersHandler.uploadUserProfilePicture(key, file);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});

app.post('/api/v1/sendResetPasswordEmail/:userName', async (req, res) => {
	const userName = req.params.userName ?? null;
	try {
		const toReturn = await usersHandler.sendResetPasswordEmail(userName);
		res.status(toReturn.statusCode ?? 200).json(toReturn);
	} catch (error) {
		res.status(error.statusCode ?? 400).json(error);
	}
});


module.exports = app;