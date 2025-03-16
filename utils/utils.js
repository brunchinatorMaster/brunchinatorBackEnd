
const JWT_SECRET = 'brunchinator5698kjsg87dsfgkj34';

/**
 * Validates the given data against a specified schema.
 *
 * This function uses the provided schema's `validate` method to check if the data conforms to the schema.
 * It returns an object containing a boolean flag indicating whether the data is valid, and any validation error.
 *
 * @param {*} toValidate - The data to validate.
 * @param {Object} schema - The schema object that contains a `validate` method.
 * @returns {{isValid: boolean, error: Object|undefined}} An object with:
 *   - isValid {boolean}: True if validation passes; otherwise, false.
 *   - error {Object|undefined}: The validation error object if validation fails; otherwise, undefined.
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
 * Creates a deep copy of the provided value.
 *
 * This function serializes the input value to JSON and then parses it back to create a new object.
 * Note that this method does not support functions, Dates, undefined, or circular references.
 *
 * @param {*} toCopy - The value to deep copy.
 * @returns {*} A deep copy of the input value.
 */
const deepCopy = (toCopy) => {
  if (!toCopy) return toCopy;
  return JSON.parse(JSON.stringify(toCopy));
};

module.exports = {
  validateBySchema,
  JWT_SECRET,
  deepCopy,
}