class DBErrorResponse {
  constructor(DBError) {
    this.success = false;
    this.statusCode = DBError?.$metadata?.httpStatusCode;
    this.message = DBError.message;
    this.error = DBError;
  }
}

module.exports = {
  DBErrorResponse
}