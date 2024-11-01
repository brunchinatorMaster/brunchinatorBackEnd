const {
	getAllUsers,
	getUserByUserId,
	getUserByUsername,
	getUserByEmail,
	addUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { 
	VALIDATE_CREATE_USER_SCHEMA,
	EMAIL_SCHEMA,
	USERNAME_SCHEMA,
	USER_ID_SCHEMA
 } = require('../schemas/usersSchemas');
const { removePassswordFromArrayOfUsers, removePassswordFromUser } = require('../utils/usersUtils');
const { validateBySchema } = require('../utils/utils');

class ReviewsHandler {
	getUsers() {
		const allUsers = getAllUsers();
		// TODO business logic, if any
		const toReturn = removePassswordFromArrayOfUsers(allUsers);
		return toReturn;
	}

	getUserByUserId(userId) {
		const validateResponse = validateBySchema(userId, USER_ID_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = getUserByUserId(userId);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn);
		return toReturn;
	}

  getUserByUsername(userName) {
		const validateResponse = validateBySchema(userName, USERNAME_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = getUserByUsername(userName);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn);
		return toReturn;
	}

  getUserByEmail(email) {
		const validateResponse = validateBySchema(email, EMAIL_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const userToReturn = getUserByEmail(email);
		// TODO do business logic, if any
		const toReturn = removePassswordFromUser(userToReturn);
		return toReturn;
	}

	addUser(user) {
		const validateResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		addUser(user);
		// TODO do business logic, if any
		return {
			success: true
		};
	}
}

module.exports = ReviewsHandler;
