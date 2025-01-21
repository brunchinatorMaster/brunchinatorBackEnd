const {
	getUserByUsername,
	getUserByEmail,
	addUser,
	deleteUser,
	updateUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { DBErrorResponse } = require('../errors/DBErrorResponse');
const { uploadImageToS3 } = require('../s3Access/s3');
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
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
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
		const emailSchemaResponse = validateBySchema(email, EMAIL_SCHEMA);
		if (!emailSchemaResponse.isValid) {
			return new BadSchemaResponse(emailSchemaResponse);
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
		const userSchemaResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!userSchemaResponse.isValid) {
			return new BadSchemaResponse(userSchemaResponse);
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
		const userSchemaResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!userSchemaResponse.isValid) {
			return new BadSchemaResponse(userSchemaResponse);
		}

		const response = await addUser(user);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		const cleanUser = removePassswordFromUser(user);
		console.log('FUCK');console.log(cleanUser)
		const token = jwt.sign(cleanUser, JWT_SECRET);
		cleanUser.token = token;

		return {
			success: true,
			user: cleanUser
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
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		const passwordSchemaResponse= validateBySchema(password, PASSWORD_SCHEMA);
		if (!passwordSchemaResponse.isValid) {
			return new BadSchemaResponse(passwordSchemaResponse);
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
		cleanUser.token = token;

		return {
			success: true,
			user: cleanUser
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
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		const response = await deleteUser(userName);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}
		return {
			success: true
		};
	}

	/**
	 * uploads file to s3 with key userName
	 * @param {string} userName 
	 * @param {file} file 
	 * @returns {
	 * 	success: true
	* }
	 */
	async uploadUserProfilePicture(userName, file){
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		//TODO validate file is an image

		const response = await uploadImageToS3(userName, file);

		if (response.DBError) {
			return new DBErrorResponse(response.DBError);
		}

		return {
			success: response.success,
		};
	}
}

module.exports = ReviewsHandler;
