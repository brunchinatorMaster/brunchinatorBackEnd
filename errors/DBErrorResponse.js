class DBErrorResponse {
  constructor(dbError) {
    this.success = false;
    this.statusCode = dbError?.$metadata?.httpStatusCode;
    this.message = dbError?.message;
    this.error = dbError;
  }
}

module.exports = {
  DBErrorResponse
}