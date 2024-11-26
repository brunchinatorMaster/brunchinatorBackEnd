class BadSchemaResponse {
  constructor(schemaResponse) {
    this.success = false;
    this.statusCode = 400;
    this.message = schemaResponse?.error?.message;
  }
}

module.exports = {
  BadSchemaResponse
}