class AWSErrorResponse {
  constructor(dbError) {
    this.success = false;
    this.statusCode = dbError?.$metadata?.httpStatusCode;
    this.message = dbError?.message ?? 'an error was encountered';
    this.error = dbError;
  }
}

module.exports = {
  AWSErrorResponse
}