
const removePassswordFromArrayOfUsers = (users) => {
  const toReturn = []
  users.forEach(user => {
    toReturn.push(removePassswordFromUser(user));
  });
  return toReturn;
}

const removePassswordFromUser = (user) => {
  delete user.password;
  return user;
}

module.exports = {
  removePassswordFromArrayOfUsers,
  removePassswordFromUser
}