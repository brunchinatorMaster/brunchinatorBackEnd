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
  validateBySchema
}