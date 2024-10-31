const users = require('../mockDataBase/users');

class ReviewsHandler {
	getUsers() { // useless comment for branchTest
		return users;
	}

	getUserByUserId(userId) {
		if (typeof userId !== 'string') {
			return [];
		}
		const allUsers = this.getUsers();
		return allUsers.filter((user) => user.userId == userId);
	}

  getUserByUsername(userName) {
		if (typeof userName !== 'string') {
			return [];
		}
		const allUsers = this.getUsers();
		return allUsers.filter((user) => user.userName == userName);
	}

  getUserByEmail(email) {
		if (typeof email !== 'string') {
			return [];
		}
		const allUsers = this.getUsers();
		return allUsers.filter((user) => user.email == email);
	}
}

module.exports = ReviewsHandler;
