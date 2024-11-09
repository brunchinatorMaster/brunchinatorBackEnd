
/**
 * removes password from an array of users
 * returns the same array with the password property removed from each element
 * 
 * @param {array} users 
 * @returns {array}
 */
const removePassswordFromArrayOfUsers = (users) => {
  const toReturn = []
  users.forEach(user => {
    toReturn.push(removePassswordFromUser(user));
  });
  return toReturn;
}

/**
 * removes password from a user
 * returns the user with the password property removed
 * 
 * @param {object} user
 * @returns {object}
 */
const removePassswordFromUser = (user) => {
  delete user.password;
  return user;
}

module.exports = {
  removePassswordFromArrayOfUsers,
  removePassswordFromUser
}