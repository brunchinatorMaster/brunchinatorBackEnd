
const JWT_SECRET = 'brunchinator5698kjsg87dsfgkj34';

/**
 * checks if the values in toValidate are consistent
 * with the restrictions in schema.
 * returns object with isValid boolean and, if applicable, an error
 * 
 * @param {object} toValidate
 * @param {object} schema
 * @returns {object}
 */
const validateBySchema = (toValidate, schema) => {
  const { error } = schema.validate(toValidate);
  let isValid = false;
  if (error == undefined) {
    isValid = true;
  }
  return {
    isValid,
    error,
  };
};

module.exports = {
  validateBySchema,
  JWT_SECRET,
}