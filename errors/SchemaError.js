class SchemaError extends Error {
  constructor(originalError) {
    super();
    this.errorInField = originalError.details[0].path;
    this.reasonForError = originalError.details[0].message;
    this.originatingRequest = originalError._original;
  }
}

module.exports = {
  SchemaError
}