const nodemailer = require('nodemailer');
const credentials = require('../emailCredentials/emailCredentials');
/**
 * removes password from an array of users
 * returns the same array with the password property removed from each element
 * 
 * @param {array} users 
 * @returns {array}
 */
const sanitizeArrayOfUsers = (users) => {
  const toReturn = []
  users.forEach(user => {
    toReturn.push(sanitizeUser(user));
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
const sanitizeUser = (user) => {
  delete user.password;
  delete user.resetCode;
  return user;
}

const sendResetPasswordEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'brunchinator.com',
    auth: {
      user: credentials.user,
      pass: credentials.pass,
      secure: true,
    }
  });
  const mailData = {
    from: 'admin@brunchinator.com',
    to: user.email,
    subject: 'Brunchinator Password Reset',
    html: `Hello there, fellow bruncher.
    <br/><br/>
    We heard you need to change your password. In order to do that you will need this 5 digit reset code:
    <br/><br/>
    ${user.resetCode}
    <br/><br/>
    Click <a href="https://www.brunchinator.com/resetPassword">here</a> to change your password.
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

const sendSignUpEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'brunchinator.com',
    auth: {
      user: credentials.user,
      pass: credentials.pass,
      secure: true,
    }
  });
  const mailData = {
    from: 'admin@brunchinator.com',
    to: user.email,
    subject: 'Welcome to Brunchinator!',
    html: `Hello there, fellow bruncher.
    <br/><br/>
    Thanks for creating an account with <a href="https://www.brunchinator.com">brunchinator.com</a> 
    <br/><br/>
    You can always read everyone's reviews, but you need to <a href="https://www.brunchinator.com/signIn">sign in</a> to use the rest of the app.
    <br/><br/>
    If you ever forget your password just <a href="https://www.brunchinator.com/forgotPassword">let us know</a> and we will help you change it.
    <br/><br/>
    Happy Brunching,<br/>
    Brunchinator Admin
    <br/><br/>
    PS: If you think of a feature you would like to see, or if you have any problems, just reply to this email and let me know. 
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
  sanitizeArrayOfUsers,
  sanitizeUser,
  sendResetPasswordEmail,
  sendSignUpEmail
}