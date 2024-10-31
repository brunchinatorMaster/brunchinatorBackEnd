const {
	getAllUsers,
	getUserByUserId,
	getUserByUsername,
	getUserByEmail,
	addUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { VALIDATE_CREATE_USER_SCHEMA } = require('../schemas/usersSchemas');
const { validateBySchema } = require('../utils/utils');

class ReviewsHandler {
	getUsers() {
		const allUsers = getAllUsers();
		// TODO business logic, if any
		return allUsers;
	}

	getUserByUserId(userId) {
		const userToReturn = getUserByUserId(userId);
		// TODO do business logic, if any
		return userToReturn;
	}

  getUserByUsername(userName) {
		const userToReturn = getUserByUsername(userName);
		// TODO do business logic, if any
		return userToReturn;
	}

  getUserByEmail(email) {
		const userToReturn = getUserByEmail(email);
		// TODO do business logic, if any
		return userToReturn;
	}

	addUser(user) {
		const validateResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);

		if(!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = addUser(user);
		// TODO do business logic, if any
		return response;
	}
}

module.exports = ReviewsHandler;
