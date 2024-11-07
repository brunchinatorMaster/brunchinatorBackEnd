const {
	getAllUsers,
	getUserByUserId,
	getUserByUsername,
	getUserByEmail,
	addUser,
	login,
 } = require('../databaseAccess/usersDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { LoginError } = require('../errors/LoginError');
const { 
	VALIDATE_CREATE_USER_SCHEMA,
	EMAIL_SCHEMA,
	USER_ID_SCHEMA,
	USERNAME_SCHEMA,
	PASSWORD_SCHEMA,
 } = require('../schemas/usersSchemas');
const { removePassswordFromArrayOfUsers, removePassswordFromUser } = require('../utils/usersUtils');
const { validateBySchema, JWT_SECRET } = require('../utils/utils');
const jwt = require('jsonwebtoken');

class ReviewsHandler {
	async getUsers() {
		const allUsers = await getAllUsers();
		// TODO business logic, if any
		const toReturn = removePassswordFromArrayOfUsers(allUsers);
		return toReturn;
	}

	async getUserByUserId(userId) {
		const validateResponse = validateBySchema(userId, USER_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = await getUserByUserId(userId);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn);
		return toReturn;
	}

  async getUserByUsername(userName) {
		const validateResponse = validateBySchema(userName, USERNAME_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = await getUserByUsername(userName);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn);
		return toReturn;
	}

  async getUserByEmail(email) {
		const validateResponse = validateBySchema(email, EMAIL_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = await getUserByEmail(email);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn); 
		return toReturn;
	}

	async addUser(user) {
		const validateResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		await addUser(user);
		// TODO do business logic, if any
		return {
			success: true
		};
	}

	async login(userName, password){
		const userNameIsValid = validateBySchema(userName, USERNAME_SCHEMA);

		if (!userNameIsValid.isValid) {
			throw new SchemaError(userNameIsValid.error);
		}

		const passwordIsValid = validateBySchema(password, PASSWORD_SCHEMA);

		if (!passwordIsValid.isValid) {
			throw new SchemaError(passwordIsValid.error);
		}

		const user = await login(userName, password);

		if(!user) {
			throw new LoginError('No User Found');
		}

		if(user.password !== password) {
			throw new LoginError('Wrong Password');
		}
		
		const cleanUser = removePassswordFromUser(user);

		const token = jwt.sign(cleanUser, JWT_SECRET);
		return {
			user: cleanUser,
			token
		};
	}
}

module.exports = ReviewsHandler;
