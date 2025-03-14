const {
	getUserByUsername,
	getUserByEmail,
	addUser,
	deleteUser,
	updateUserPassword,
	addResetCodeToUser,
 } = require('../databaseAccess/usersDatabaseAccess');
const { BadSchemaResponse } = require('../errors/BadSchemaResponse');
const { AWSErrorResponse } = require('../errors/AWSErrorResponse');
const { uploadUserProfileImageToS3 } = require('../s3Access/s3');
const { 
	VALIDATE_CREATE_USER_SCHEMA,
	VALIDATE_CHANGE_USER_PASSWORD_SCHEMA,
	EMAIL_SCHEMA,
	USERNAME_SCHEMA,
	PASSWORD_SCHEMA,
 } = require('../schemas/usersSchemas');
const { sanitizeUser, sendResetPasswordEmail, sendSignUpEmail } = require('../utils/usersUtils');
const { validateBySchema, JWT_SECRET } = require('../utils/utils');
const jwt = require('jsonwebtoken');

class ReviewsHandler {

/**
 * Retrieves a user by their username.
 *
 * This asynchronous method first validates the provided username against the USERNAME_SCHEMA using
 * `validateBySchema`. If validation fails, it returns a BadSchemaResponse with the validation errors.
 * If validation is successful, it fetches the user details using `getUserByUsername`.
 * In case of a database error, it returns an AWSErrorResponse.
 * If a user is found, the user data is sanitized using `sanitizeUser` before being returned.
 *
 * @async
 * @param {string} userName - The username to search for, which must conform to USERNAME_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object containing:
 *   - success {boolean}: Indicates if the operation was successful.
 *   - userExists {boolean}: Indicates whether a user with the given username was found.
 *   - user {Object|undefined}: The sanitized user data if found; otherwise undefined.
 */
  async getUserByUsername(userName) {
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		const response = await getUserByUsername(userName);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		let user;
		if (response.success && response.user) {
			user = sanitizeUser(response.user);
		}

		return {
			success: true,
			userExists: response.success,
			user,
		}
	}

/**
 * Retrieves a user by their email address.
 *
 * This asynchronous method validates the provided email against the EMAIL_SCHEMA using `validateBySchema`.
 * If validation fails, it returns a BadSchemaResponse containing the validation errors.
 * If the email is valid, it calls `getUserByEmail` to fetch the user details.
 * In case of a database error, it returns an AWSErrorResponse.
 * If a user is found, the user data is sanitized using `sanitizeUser` before being returned.
 *
 * @async
 * @param {string} email - The email address of the user to retrieve, which must conform to EMAIL_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the operation completed successfully.
 *   - userExists {boolean}: Indicates whether a user with the given email was found.
 *   - user {Object|undefined}: The sanitized user data if found, otherwise undefined.
 */
  async getUserByEmail(email) {
		const emailSchemaResponse = validateBySchema(email, EMAIL_SCHEMA);
		if (!emailSchemaResponse.isValid) {
			return new BadSchemaResponse(emailSchemaResponse);
		}

		const response = await getUserByEmail(email);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		let user;
		if (response.success && response.user) {
			user = sanitizeUser(response.user);
		}

		return {
			success: true,
			userExists: response.success,
			user,
		}
	}

/**
 * Updates a user's password after validating the provided data and verifying the reset code.
 *
 * This asynchronous method performs the following operations:
 * 1. Validates the provided user object against the VALIDATE_CHANGE_USER_PASSWORD_SCHEMA using `validateBySchema`.
 *    If the validation fails, a BadSchemaResponse is returned with the validation errors.
 * 2. Retrieves the current user data by username via `getUserByUsername`.
 *    If a database error occurs, an AWSErrorResponse is returned.
 * 3. Checks whether the user exists and if the provided reset code matches the one stored in the user's record.
 *    If the user does not exist or the reset code is incorrect, it returns an object with success set to false,
 *    a status code of 401, and an appropriate error message.
 * 4. Proceeds to update the user's password by calling `updateUserPassword`.
 *    If a database error occurs during the update, an AWSErrorResponse is returned.
 * 5. On successful update, the updated user data is sanitized using `sanitizeUser` and a JWT token is generated
 *    and attached to the user object.
 * 6. Finally, returns an object containing a success flag and the sanitized user object (including the token).
 *
 * @async
 * @param {Object} user - The user object containing the necessary properties for updating the password.
 *   Expected properties include:
 *   - userName {string}: The username of the user.
 *   - resetCode {string}: The code used to verify the password reset request.
 *   - (Other password-related fields as defined by VALIDATE_CHANGE_USER_PASSWORD_SCHEMA)
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success {boolean}: Indicates if the password update was successful.
 *   - user {Object}: The sanitized user object with an attached JWT token, if the update is successful.
 *   Alternatively, returns an error response (AWSErrorResponse or BadSchemaResponse) if validation or database errors occur,
 *   or an object with success set to false and a 401 status code if the user is not found or the reset code is invalid.
 */
	async updateUserPassword(user) {
		const userSchemaResponse = validateBySchema(user, VALIDATE_CHANGE_USER_PASSWORD_SCHEMA);
		if (!userSchemaResponse.isValid) {
			return new BadSchemaResponse(userSchemaResponse);
		}

		let userResponse = await getUserByUsername(user.userName);

		if (userResponse.DBError) {
			return new AWSErrorResponse(userResponse.DBError);
		}

		if (!userResponse.success) {
			return {
				success: false,
				statusCode: 401,
				message: 'No User Found'
			}
		}

		if (user.resetCode !== userResponse.user.resetCode) {
			return {
				success: false,
				statusCode: 401,
				message: 'Reset Code is wrong.'
			}
		}

		const response = await updateUserPassword(user);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		let cleanUser;
		let token;
		if (response.success && response.user) {
			cleanUser = sanitizeUser(response.user);
			token = jwt.sign(cleanUser, JWT_SECRET);
			cleanUser.token = token;
		}

		return {
			success: true,
			user: cleanUser,
		};
	}

/**
 * Adds a new user to the system after validating the provided data and ensuring the username is not already taken.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided user object against the VALIDATE_CREATE_USER_SCHEMA using `validateBySchema`.
 *    If validation fails, it returns a BadSchemaResponse with the validation errors.
 * 2. Checks if a user with the given username already exists by calling `getUserByUsername`.
 *    If a database error occurs, an AWSErrorResponse is returned.
 *    If the username is already taken, it returns an object with success set to false, a 409 status code, and an appropriate message.
 * 3. Adds the new user by calling `addUser`.
 *    If a database error occurs during this process, an AWSErrorResponse is returned.
 * 4. Sends a sign-up email using `sendSignUpEmail`.
 * 5. Sanitizes the user data using `sanitizeUser` and generates a JWT token with `jwt.sign` using JWT_SECRET.
 * 6. Returns an object containing a success flag and the sanitized user object (with the token attached).
 *
 * @async
 * @param {Object} user - The user object containing the necessary properties for user creation,
 *   which must conform to the VALIDATE_CREATE_USER_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success {boolean}: True if the user was successfully added.
 *   - user {Object}: The sanitized user object with an attached JWT token.
 *   Alternatively, returns an error response (BadSchemaResponse or AWSErrorResponse) if validation or a database error occurs,
 *   or an object with success set to false and a 409 status code if the username is already taken.
 */
	async addUser(user) {
		const userSchemaResponse = validateBySchema(user, VALIDATE_CREATE_USER_SCHEMA);
		if (!userSchemaResponse.isValid) {
			return new BadSchemaResponse(userSchemaResponse);
		}

		let userResponse = await getUserByUsername(user.userName);

		if (userResponse.DBError) {
			return new AWSErrorResponse(userResponse.DBError);
		}

		if (userResponse.success) {
			return {
				success: false,
				statusCode: 409,
				message: 'That username is already taken.'
			}
		}

		const response = await addUser(user);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}
		sendSignUpEmail(user);
		const cleanUser = sanitizeUser(user);
		const token = jwt.sign(cleanUser, JWT_SECRET);
		cleanUser.token = token;

		return {
			success: true,
			user: cleanUser
		};
	}

/**
 * Authenticates a user using their username and password.
 *
 * This asynchronous method performs the following operations:
 * 1. Validates the provided username against the USERNAME_SCHEMA using `validateBySchema`.
 *    If validation fails, a BadSchemaResponse is returned.
 * 2. Validates the provided password against the PASSWORD_SCHEMA using `validateBySchema`.
 *    If validation fails, a BadSchemaResponse is returned.
 * 3. Retrieves the user using `getUserByUsername` with the provided username and password.
 *    If a database error occurs, an AWSErrorResponse is returned.
 * 4. If no user is found, returns an object with success set to false, a status code of 401, and a message 'No User Found'.
 * 5. If the provided password does not match the stored password, returns an object with success set to false, a status code of 401, and a message 'Wrong Password'.
 * 6. Sanitizes the retrieved user data using `sanitizeUser` and generates a JWT token using `jwt.sign` with JWT_SECRET.
 * 7. Attaches the token to the sanitized user object and returns an object with success set to true and the user.
 *
 * @async
 * @param {string} userName - The username of the user attempting to log in, which must conform to USERNAME_SCHEMA.
 * @param {string} password - The password of the user, which must conform to PASSWORD_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object containing:
 *   - success {boolean}: True if authentication is successful.
 *   - user {Object}: The sanitized user object with an attached JWT token,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if validation or a database error occurs,
 * or an object with success false and a 401 status code if the user is not found or the password is incorrect.
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
			return new AWSErrorResponse(response.DBError);
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
			
		const cleanUser = sanitizeUser(response.user);
		const token = jwt.sign(cleanUser, JWT_SECRET);
		cleanUser.token = token;

		return {
			success: true,
			user: cleanUser
		};
	}

/**
 * Deletes a user based on the provided username.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided username against the USERNAME_SCHEMA using `validateBySchema`.
 *    If validation fails, a BadSchemaResponse is returned.
 * 2. Calls the `deleteUser` service function to remove the user from the database.
 *    If a database error occurs during deletion, an AWSErrorResponse is returned.
 * 3. On success, returns an object with a success flag set to true.
 *
 * @async
 * @param {string} userName - The username of the user to be deleted, which must conform to USERNAME_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success {boolean}: True if the user was successfully deleted,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if validation or a database error occurs.
 */
	async deleteUser(userName) {
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		const response = await deleteUser(userName);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}
		return {
			success: true
		};
	}

	/**
 * Uploads a user's profile picture to S3.
 *
 * This asynchronous method performs the following steps:
 * 1. Validates the provided username against the USERNAME_SCHEMA using `validateBySchema`. 
 *    If validation fails, it returns a BadSchemaResponse with the validation errors.
 * 2. (TODO) Validates that the provided file is an image.
 * 3. Uploads the user's profile image to S3 by calling `uploadUserProfileImageToS3` with the username and file.
 * 4. If the upload operation returns a database error (response.DBError), it returns an AWSErrorResponse.
 * 5. Otherwise, it returns an object containing a success flag.
 *
 * @async
 * @param {string} userName - The username of the user, which must conform to USERNAME_SCHEMA.
 * @param {File|Object} file - The file object representing the user's profile picture.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to an object with:
 *   - success {boolean}: True if the upload was successful,
 * or an error response (AWSErrorResponse or BadSchemaResponse) if validation fails or a database error occurs.
 */
	async uploadUserProfilePicture(userName, file){
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		//TODO validate file is an image

		const response = await uploadUserProfileImageToS3(userName, file);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		return {
			success: response.success,
		};
	}

/**
 * Sends a reset password email to the user with the specified username.
 *
 * This asynchronous method performs the following operations:
 * 1. Validates the provided username against USERNAME_SCHEMA using `validateBySchema`.
 *    If the validation fails, a BadSchemaResponse is returned.
 * 2. Retrieves the user details using `getUserByUsername`.
 *    If a database error occurs, an AWSErrorResponse is returned.
 *    If the user is not found, returns an object with success set to false, a 401 status code, and an appropriate message.
 * 3. Generates a random 5-digit reset code and assigns it to the user.
 * 4. Updates the user record with the reset code by calling `addResetCodeToUser`.
 *    If a database error occurs during the update, an AWSErrorResponse is returned.
 * 5. Sends the reset password email using `sendResetPasswordEmail` with the updated user object.
 * 6. Returns the response from the email sending operation.
 *
 * @async
 * @param {string} userName - The username of the user requesting a password reset, which must conform to USERNAME_SCHEMA.
 * @returns {Promise<Object|AWSErrorResponse|BadSchemaResponse>} A promise that resolves to:
 *   - The response from the reset password email operation if successful,
 *   - An AWSErrorResponse if a database error occurs,
 *   - Or a BadSchemaResponse if the username validation fails.
 */
	async sendResetPasswordEmail(userName) {
		const userNameSchemaResponse = validateBySchema(userName, USERNAME_SCHEMA);
		if (!userNameSchemaResponse.isValid) {
			return new BadSchemaResponse(userNameSchemaResponse);
		}

		let response = await getUserByUsername(userName);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		if (!response.success) {
			return {
				success: false,
				statusCode: 401,
				message: 'No User Found'
			}
		}

		const user = response.user;
		user.resetCode  = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

		response = await addResetCodeToUser(user);

		if (response.DBError) {
			return new AWSErrorResponse(response.DBError);
		}

		const emailResponse = await sendResetPasswordEmail(user);

		return emailResponse;
	}
}

module.exports = ReviewsHandler;
