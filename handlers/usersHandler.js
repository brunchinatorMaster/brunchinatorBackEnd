const {
	getAllUsers,
	getUserByUserId,
	getUserByUsername,
	getUserByEmail
 } = require('../databaseAccess/usersDatabaseAccess');

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
}

module.exports = ReviewsHandler;
