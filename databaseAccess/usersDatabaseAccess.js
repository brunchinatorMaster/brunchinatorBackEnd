const { 
  docClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} = require('../aws/awsClients');

/**
 * Retrieves a user from the "Users" table in DynamoDB by their username.
 *
 * This asynchronous function uses the AWS SDK's QueryCommand to query the "Users" table.
 * It filters the records using a key condition expression where the userName matches the provided value,
 * and performs a consistent read to ensure the most up-to-date data is returned.
 * If a user is found, the function sets the success flag to true and returns the first matching user.
 * Any error encountered during the query is captured in the DBError field.
 *
 * @async
 * @param {string} userName - The username of the user to retrieve.
 * @returns {Promise<{success: boolean, user?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if a user was successfully retrieved.
 *   - user {Object} (optional): The user object retrieved from the table, if found.
 *   - DBError {Error} (optional): The error encountered during the query, if any.
 */
const getUserByUsername = async (userName) => {
  const queryCommand = new QueryCommand({
    TableName: 'Users',
    ExpressionAttributeValues: {
      ':userName': userName,
    },
    KeyConditionExpression: 'userName = :userName',
    ConsistentRead: true,
  });

  let success = false;
  let user;
  let DBError;
  try {
    const response = await docClient.send(queryCommand);
    if (response?.Items?.length > 0) {
      success = true;
      user = response.Items[0]
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      user,
      DBError
    }
  }
}

/**
 * Retrieves a user from the "Users" table in DynamoDB by their email address.
 *
 * This asynchronous function uses the AWS SDK's ScanCommand to scan the "Users" table.
 * It applies a filter expression to return only the user(s) whose email matches the provided value.
 * The function projects only the userName and email attributes. If a matching user is found,
 * the success flag is set to true and the first matching user is returned.
 * Any errors encountered during the scan are captured in the DBError field.
 *
 * @async
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<{success: boolean, user?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if a user was successfully retrieved.
 *   - user {Object} (optional): The user object containing userName and email, if found.
 *   - DBError {Error} (optional): The error encountered during the scan, if any.
 */
const getUserByEmail = async (email) => {
  const scanCommand = new ScanCommand({
    TableName: "Users",
    ExpressionAttributeValues: {
      ':email': email,
    },
    FilterExpression: 'email = :email',
    ProjectionExpression: "userName, email",
  });

  let success = false;
  let user;
  let DBError;
  try {
    const response = await docClient.send(scanCommand);
    if (response?.Items?.length > 0) {
      success = true;
      user = response.Items[0]
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      user,
      DBError
    }
  }
}

/**
 * Updates a user's password in the "Users" table and removes the reset code.
 *
 * This asynchronous function uses the AWS SDK's UpdateCommand to update the password for a user identified
 * by their userName in the "Users" table. It sets the new password and removes the resetCode attribute.
 * The operation is conditional on the existence of the userName attribute (i.e., the user exists).
 * If the update is successful, the updated user attributes are returned.
 * Any errors encountered during the update are captured in the DBError field.
 *
 * @async
 * @param {Object} user - The user object containing the updated password and the userName.
 *   Expected properties include:
 *     - userName {string}: The unique username identifying the user.
 *     - password {string}: The new password for the user.
 * @returns {Promise<{success: boolean, user?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the update was successful.
 *   - user {Object} (optional): The updated user object returned by DynamoDB.
 *   - DBError {Error} (optional): The error encountered during the update, if any.
 */
const updateUserPassword = async (user) => {
  const toUpdate = new UpdateCommand({
    TableName: 'Users',
    Key: {
      userName: user.userName,
    },
    UpdateExpression: 'set password = :password remove resetCode',
    ConditionExpression: 'attribute_exists(userName)',
    ExpressionAttributeValues: {
      ":password": user.password,
    },
    ReturnValues: "ALL_NEW",
  });

  let success = false;
  let updatedUser;
  let DBError;
  
  try {
    const response = await docClient.send(toUpdate);
    if (response?.Attributes) {
      success = true;
      updatedUser = response.Attributes;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      user: updatedUser,
      DBError
    }
  }
}

/**
 * Adds the reset code for a user in the "Users" table.
 *
 * This asynchronous function uses the AWS SDK's UpdateCommand to set the resetCode attribute for a user
 * identified by their userName in the "Users" table. The operation is conditional on the existence of the userName attribute,
 * ensuring that the user exists. If the update is successful, the updated user attributes are returned.
 * Any error encountered during the update is captured in the DBError field.
 *
 * @async
 * @param {Object} user - The user object containing the userName and the new resetCode.
 *   Expected properties include:
 *     - userName {string}: The unique username identifying the user.
 *     - resetCode {number|string}: The new reset code to be added to the user's record.
 * @returns {Promise<{success: boolean, user?: Object, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the reset code was successfully added/updated.
 *   - user {Object} (optional): The updated user object returned by DynamoDB.
 *   - DBError {Error} (optional): The error encountered during the update, if any.
 */
const addResetCodeToUser = async (user) => {
  const toUpdate = new UpdateCommand({
    TableName: 'Users',
    Key: {
      userName: user.userName,
    },
    UpdateExpression: 'set resetCode = :resetCode',
    ConditionExpression: 'attribute_exists(userName)',
    ExpressionAttributeValues: {
      ":resetCode": user.resetCode,
    },
    ReturnValues: "ALL_NEW",
  });

  let success = false;
  let updatedUser;
  let DBError;
  
  try {
    const response = await docClient.send(toUpdate);
    if (response?.Attributes) {
      success = true;
      updatedUser = response.Attributes;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      user: updatedUser,
      DBError
    }
  }
}

/**
 * Adds a new user to the "Users" table in DynamoDB.
 *
 * This asynchronous function uses the AWS SDK's PutCommand to insert the provided user object
 * into the "Users" table. If the operation completes without encountering a ValidationException,
 * the function sets the success flag to true. Any error encountered during the operation is captured
 * in the DBError field.
 *
 * @async
 * @param {Object} user - The user object to be added to the DynamoDB "Users" table.
 * @returns {Promise<{success: boolean, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the user was added successfully.
 *   - DBError {Error} (optional): The error encountered during the operation, if any.
 */
const addUser = async (user) => {
  const toPut = new PutCommand({
    TableName: 'Users',
    Item: user,
  });

  let success = false;
  let DBError;
  try {
    const response = await docClient.send(toPut);
    if (!response?.ValidationException) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      DBError
    }
  }
}

/**
 * Deletes a user from the "Users" table in DynamoDB by their username.
 *
 * This asynchronous function uses the AWS SDK's DeleteCommand to remove a user identified by the provided userName.
 * If the deletion operation completes without encountering a ValidationException, the success flag is set to true.
 * Any error encountered during the deletion is captured in the DBError field. The function returns an object with
 * the success status, a null user value, and the DBError if applicable.
 *
 * @async
 * @param {string} userName - The username of the user to be deleted.
 * @returns {Promise<{success: boolean, user: null, DBError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the user was successfully deleted.
 *   - user {null}: Always returns null for the user field.
 *   - DBError {Error} (optional): The error encountered during the deletion, if any.
 */
const deleteUser = async (userName) => {
  const toDelete = new DeleteCommand({
    TableName: 'Users',
    Key: {
      userName,
    }
  });
  let success = false;
  let DBError;
  try {
    const response = await docClient.send(toDelete);
    if (!response?.ValidationException) {
      success = true;
    }
  } catch (error) {
    DBError = error;
  } finally {
    return {
      success,
      user: null,
      DBError
    }
  }
}

module.exports = {
  getUserByUsername,
  getUserByEmail,
  addUser,
  deleteUser,
  updateUserPassword,
  addResetCodeToUser
}
