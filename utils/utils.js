
const JWT_SECRET = 'brunchinator5698kjsg87dsfgkj34';

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