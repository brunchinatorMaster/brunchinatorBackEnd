const {
	getUserByUsername,
	getUserByEmail,
	addUser,
	deleteUser,
	updateUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { SchemaError } = require('../errors/SchemaError');
const { LoginError } = require('../errors/LoginError');
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
	 * returns user that matches userName
	 *  
	 * @param {string} userName 
	 * @returns {object}
	 */
  async getUserByUsername(userName) {
		const validateResponse = validateBySchema(userName, USERNAME_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = await getUserByUsername(userName);

		if (response.DBError) {
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
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
	 * returns user that matches email
	 *  
	 * @param {string} email 
	 * @returns {object}
	 */
  async getUserByEmail(email) {
		const validateResponse = validateBySchema(email, EMAIL_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = await getUserByEmail(email);

		if (response.DBError) {
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
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
	 * updates user, 
	 * and returns an object with success: true
	 * 
	 * @param {object} user 
	 * @returns {object}
	 */
	async updateUser(user) {
		const validateResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = await updateUser(user);

		if (response.DBError) {console.log('ding ding ding');console.log(response)
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
		}

		let updatedUser;
		if (response.success && response.user) {
			updatedUser = removePassswordFromUser(response.user);
		}

		return {
			success: true,
			updatedUser,
			DBError: response.DBError
		};
	}

	/**
	 * adds user, 
	 * and returns an object with success: true
	 * 
	 * @param {object} user 
	 * @returns {object}
	 */
	async addUser(user) {
		const validateResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = await addUser(user);

		if (response.DBError) {
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
		}

		return {
			success: true,
			DBError: response.DBError
		};
	}

	/**
	 * checks userName and password against database, 
	 * returns error if no user is found that matches userName
	 * returns error if password doesn't match
	 * returns object with cleanUser and token if login is success
	 * 
	 * @param {string} userName 
	 * @param {string} password 
	 * @returns {object}
	 */
	async login(userName, password) {
		const userNameIsValid = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameIsValid.isValid) {
			throw new SchemaError(userNameIsValid.error);
		}

		const passwordIsValid = validateBySchema(password, PASSWORD_SCHEMA);
		if (!passwordIsValid.isValid) {
			throw new SchemaError(passwordIsValid.error);
		}

		const response = await getUserByUsername(userName, password);

		if (response.DBError) {
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
		}

		if (!response.success) {
			throw new LoginError('No User Found');
		}

		if (response.user.password !== password) {
			throw new LoginError('Wrong Password');
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
	 * deletes user, 
	 * and returns an object with success: true
	 * NOTE: purely a utility function and will
	 * probably never actually be used
	 * 
	 * @param {string} userName 
	 * @returns {object}
	 */
	async deleteUser(userName) {
		const validateResponse = validateBySchema(userName, USERNAME_SCHEMA);

		if (!validateResponse.isValid) {
			throw new SchemaError(validateResponse.error);
		}

		const response = await deleteUser(userName);

		if (response.DBError) {
			return {
				success: false,
				statusCode: response.DBError?.$metadata?.httpStatusCode,
				message: response.DBError.message
			}
		}
		return {
			success: true
		};
	}
}

module.exports = ReviewsHandler;
