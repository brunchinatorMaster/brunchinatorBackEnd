const users = require('../mockDataBase/users');

/**
 * returns all users
 * 
 * @returns {object[]}
 */
const getAllUsers = () => {
  // TODO this will be replaced with a call to the database to get all places
  // at some point i may introduce pagination, not sure yet
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers;
}

/**
 * returns user that has matching userId
 * 
 * @param {string} userId 
 * @returns {object}
 */
const getUserByUserId = (userId) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one user by id, or some filtering of allUsers
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers.filter((user) => user.userId == userId)?.[0] ?? null;
}

/**
 * returns user that has matching userName
 * 
 * @param {string} userName 
 * @returns {object}
 */
const getUserByUsername = (userName) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one user by id, or some filtering of allUsers
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers.filter((user) => user.userName == userName)?.[0] ?? null;
}

/**
 * returns user that has matching email
 * 
 * @param {string} email 
 * @returns {object}
 */
const getUserByEmail = (email) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one user by id, or some filtering of allUsers
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers.filter((user) => user.email == email)?.[0] ?? null;
}

module.exports = {
  getAllUsers,
  getUserByUserId,
  getUserByUsername,
  getUserByEmail
}
