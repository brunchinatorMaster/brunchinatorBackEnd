/**
 * Represents an error response for AWS database operations.
 *
 * This class is used to create a standardized error response when an AWS database error occurs.
 * It sets the success flag to false and extracts the HTTP status code and error message from
 * the provided AWS error object.
 *
 * @class AWSErrorResponse
 */
class AWSErrorResponse {

  /**
   * Creates an instance of AWSErrorResponse.
   *
   * @param {Object} dbError - The error object returned from an AWS database operation.
   *   Expected to contain a `$metadata` property with an `httpStatusCode` and a `message` property.
   */
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