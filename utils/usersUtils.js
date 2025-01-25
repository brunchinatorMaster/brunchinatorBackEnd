const nodemailer = require('nodemailer');
const credentials = require('../emailCredentials/emailCredentials');
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

const sendResetPasswordEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
      user: credentials.user,
      pass: credentials.pass,
      secure: true,
    }
  });
  const mailData = {
    from: 'brunchinatorMaster@gmail.com',
    to: 'foo',//user.email,
    subject: 'localServer Brunchinator Password Test',
    html: `Hello there, fellow bruncher.
    <br/><br/>
    Your password reset code is ${user.resetCode}
    <br/><br/>
    Click <a href="https://www.brunchinator.com/resetPassword">here</a> to reset your password.
    `
  };

  let success = false;
  let response;
  let emailError;

  try {
    const emailResponse = await transporter.sendMail(mailData);
    success = true;
    response = emailResponse;
  } catch (error) {
    success = false;
    emailError = error
  }

  return {
    success,
    response,
    emailError,
  }
}

module.exports = {
  removePassswordFromArrayOfUsers,
  removePassswordFromUser,
  sendResetPasswordEmail
}