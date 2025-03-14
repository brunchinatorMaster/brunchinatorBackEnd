const nodemailer = require('nodemailer');
const credentials = require('../emailCredentials/emailCredentials');

/**
 * Sanitizes an array of user objects by removing sensitive fields from each user.
 *
 * This function iterates over an array of user objects and applies the `sanitizeUser` function
 * to each user, returning a new array with the sanitized users.
 *
 * @param {Array<Object>} users - An array of user objects to sanitize.
 * @returns {Array<Object>} A new array of sanitized user objects.
 */
const sanitizeArrayOfUsers = (users) => {
  const toReturn = []
  users.forEach(user => {
    toReturn.push(sanitizeUser(user));
  });
  return toReturn;
}

/**
 * Sanitizes a user object by removing sensitive fields.
 *
 * This function removes the `password` and `resetCode` properties from the user object.
 *
 * @param {Object} user - The user object to sanitize.
 * @returns {Object} The sanitized user object.
 */
const sanitizeUser = (user) => {
  delete user.password;
  delete user.resetCode;
  return user;
}

/**
 * Sends a reset password email to the specified user.
 *
 * This asynchronous function creates a Nodemailer transporter to send an email containing the user's reset code.
 * It constructs the email with a subject and HTML body, then sends it using the transporter's `sendMail` method.
 * The function returns an object indicating whether the email was sent successfully, along with the response or any error.
 *
 * @async
 * @param {Object} user - The user object containing at least the `email` and `resetCode` properties.
 * @returns {Promise<{success: boolean, response?: Object, emailError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the email was sent successfully.
 *   - response {Object} (optional): The response from Nodemailer if the email was sent.
 *   - emailError {Error} (optional): The error encountered while attempting to send the email.
 */
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

/**
 * Sends a sign-up welcome email to the specified user.
 *
 * This asynchronous function creates a Nodemailer transporter to send a welcome email to the new user.
 * It constructs the email with a subject and HTML body that includes information about signing in and password resets.
 * The function returns an object indicating whether the email was sent successfully, along with the response or any error.
 *
 * @async
 * @param {Object} user - The user object containing at least the `email` property.
 * @returns {Promise<{success: boolean, response?: Object, emailError?: Error}>} A promise that resolves to an object containing:
 *   - success {boolean}: True if the welcome email was sent successfully.
 *   - response {Object} (optional): The response from Nodemailer if the email was sent.
 *   - emailError {Error} (optional): The error encountered while attempting to send the email.
 */
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