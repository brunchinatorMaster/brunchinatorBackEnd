const users = require('../mockDataBase/users');

/**
 * returns all users
 * 
 * @returns {object[]}
 */
const getAllUsers = async () => {
  // TODO this will be replaced with a call to the database to get all users
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
const getUserByUserId = async (userId) => {
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
const getUserByUsername = async (userName) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one user by userName, or some filtering of allUsers
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers.filter((user) => user.userName == userName)?.[0] ?? null;
}

/**
 * returns user that has matching email
 * 
 * @param {string} email 
 * @returns {object}
 */
const getUserByEmail = async (email) => {
  // TODO this will be replaced with either a call to the database to specifically
  // grab one user by email, or some filtering of allUsers
  const mockUsers = JSON.parse(JSON.stringify(users));
  return mockUsers.filter((user) => user.email == email)?.[0] ?? null;
}

const addUser = async (user) => {
  // TODO this will be replaced with a call to add a new record to the
  // users table in the database
  const mockUsers = JSON.parse(JSON.stringify(users));
  mockUsers.push(user);
  return mockUsers;
}

const login = async (userName, password) => {
  const user = await getUserByUsername(userName);
  return user;
}

module.exports = {
  getAllUsers,
  getUserByUserId,
  getUserByUsername,
  getUserByEmail,
  addUser,
  login,
}
