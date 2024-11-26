class BadSchemaResponse {
  constructor(SchemaResponse) {
    this.success = false;
    this.statusCode = 400;
    this.message = SchemaResponse?.error?.message;
  }
}

module.exports = {
  BadSchemaResponse
}