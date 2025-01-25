const { 
  docClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} = require('../aws/awsClients');

/**
 * finds user in dynamo that has matching userName
 * returns {
 *  success: boolean,
 *  user: USER || null,
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} userName 
 * @returns {object}
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
 * returns user in dynamo that has matching email
 * returns {
 *  success: boolean,
 *  user: USER || null,
 *  DBError: ERROR || null
 * }
 * 
 * @param {string} email 
 * @returns {object}
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
 * updates user password in dynamo
 * returns {
 *  success: boolean,
 *  user: USER || null,
 *  DBError: ERROR || null
 * }
 * @param {object} user 
 * @returns {object}
 */
const updateUserPassword = async (user) => {
  const toUpdate = new UpdateCommand({
    TableName: 'Users',
    Key: {
      userName: user.userName,
    },
    UpdateExpression: 'set password = :password',
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
 * adds resetCode to user in dynamo
 * returns {
 *  success: boolean,
 *  user: USER || null,
 *  DBError: ERROR || null
 * }
 * @param {object} user 
 * @returns {object}
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
 * adds user to dynamo
 * returns {
 *  success: boolean,
 *  DBError:error || null
 * }
 * @param {object} user 
 * @returns {object}
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
 * deletes user from dynamo
 * returns {
 *  success: boolean,
 *  user: null,
 *  DBError: ERROR || null
 * }
 * NOTE: purely a utility function and will
 * probably never actually be used
 * @param {object} user 
 * @returns {object}
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
