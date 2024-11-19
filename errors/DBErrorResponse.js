class DBErrorResponse {
  constructor(statusCode, message) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = {
  DBErrorResponse
}