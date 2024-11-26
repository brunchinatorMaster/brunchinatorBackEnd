const {
	getUserByUsername,
	getUserByEmail,
	addUser,
	deleteUser,
	updateUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { 
	VALIDATE_CREATE_USER_SCHEMA,
	EMAIL_SCHEMA,
	USERNAME_SCHEMA,
	PASSWORD_SCHEMA,
 } = require('../schemas/usersSchemas');
const { removePassswordFromUser } = require('../utils/usersUtils');
const { validateBySchema, JWT_SECRET } = require('../utils/utils');
const jwt = require('jsonwebtoken');

class ReviewsHandler {

	/**
	 * finds user that matches userName
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	userExists: boolean,
	 * 	user: USER || null
	 * }
	 *  
	 * @param {string} userName 
	 * @returns {object}
	 */
  async getUserByUsername(userName) {
		const userNameIsValid = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameIsValid.isValid) {
			return new BadSchemaResponse(400, userNameIsValid.error.message);
		}

		const response = await getUserByUsername(userName);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		let user;
		if (response.success && response.user) {
			user = removePassswordFromUser(response.user);
		}

		return {
			success: true,
			userExists: response.success,
			user,
		}
	}

	/**
	 * finds user that matches email
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	userExists: boolean,
	 * 	user: USER || null
	 * }
	 *  
	 * @param {string} email 
	 * @returns {object}
	 */
  async getUserByEmail(email) {
		const emailIsValid = validateBySchema(email, EMAIL_SCHEMA);
		if (!emailIsValid.isValid) {
			return new BadSchemaResponse(400, emailIsValid.error.message);
		}

		const response = await getUserByEmail(email);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		let user;
		if (response.success && response.user) {
			user = removePassswordFromUser(response.user);
		}

		return {
			success: true,
			userExists: response.success,
			user,
		}
	}

	/**
	 * updates user
	 * 
	 * returns {
	 * 	success: boolean,
	 * 	updatedUser: USER || null,
	 * }
	 * 
	 * @param {object} user 
	 * @returns {object}
	 */
	async updateUser(user) {
		const userIsValid = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!userIsValid.isValid) {
			return new BadSchemaResponse(400, userIsValid.error.message);
		}

		const response = await updateUser(user);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		let updatedUser;
		if (response.success && response.user) {
			updatedUser = removePassswordFromUser(response.user);
		}

		return {
			success: true,
			updatedUser,
		};
	}

	/**
	 * adds user, 
	 * 
	 * returns {
	 * 	success: boolean,
	 * }
	 * 
	 * @param {object} user 
	 * @returns {object}
	 */
	async addUser(user) {
		const userIsValid = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!userIsValid.isValid) {
			return new BadSchemaResponse(400, userIsValid.error.message);
		}

		const response = await addUser(user);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: true,
		};
	}

	/**
	 * checks userName and password against database, 
	 * returns 401 if no user is found that matches userName
	 * returns 401 if password doesn't match
	 * 
	 * returns {
	 * 	success: true,
	 * 	user: USER(without password) || null,
	 * 	token: jwtToken
	 * }
	 * 
	 * @param {string} userName 
	 * @param {string} password 
	 * @returns {object}
	 */
	async login(userName, password) {
		const userNameIsValid = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameIsValid.isValid) {
			return new BadSchemaResponse(400, userNameIsValid.error.message);
		}

		const passwordIsValid = validateBySchema(password, PASSWORD_SCHEMA);
		if (!passwordIsValid.isValid) {
			return new BadSchemaResponse(400, passwordIsValid.error.message);
		}

		const response = await getUserByUsername(userName, password);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		if (!response.success) {
			return {
				success: false,
				statusCode: 401,
				message: 'No User Found'
			}
		}

		if (response.user.password !== password) {
			return {
				success: false,
				statusCode: 401,
				message: 'Wrong Password'
			}
		}
			
		const cleanUser = removePassswordFromUser(response.user);

		const token = jwt.sign(cleanUser, JWT_SECRET);
		return {
			success: true,
			user: cleanUser,
			token
		};
	}

	/**
	 * deletes user
	 * NOTE: purely a utility function and will
	 * probably never actually be used
	 * 
	 * returns {
	 * 	success: true
	 * }
	 * 
	 * @param {string} userName 
	 * @returns {object}
	 */
	async deleteUser(userName) {
		const userNameIsValid = validateBySchema(userName, USERNAME_SCHEMA);

		if (!userNameIsValid.isValid) {
			return new BadSchemaResponse(400, userNameIsValid.error.message);
		}

		const response = await deleteUser(userName);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}
		return {
			success: true
		};
	}
}

module.exports = ReviewsHandler;
