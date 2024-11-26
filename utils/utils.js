
const JWT_SECRET = 'brunchinator5698kjsg87dsfgkj34';

/**
 * checks if the values in toValidate are consistent
 * with the restrictions in schema.
 * returns {
 *  isValid: boolean,
 *  error: ERROR || null
 * }
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

/**
 * copies an object by value
 * 
 * @param {object} toCopy 
 * @returns {object}
 */
const deepCopy = (toCopy) => {
  return JSON.parse(JSON.stringify(toCopy));
};

module.exports = {
  validateBySchema,
  JWT_SECRET,
  deepCopy,
}