/**
 * Represents an error response for schema validation failures.
 *
 * This class is used to create a standardized error response when a schema validation error occurs.
 * It sets the success flag to false, the HTTP status code to 400, and includes the error message from the schema response.
 *
 * @class BadSchemaResponse
 */
class BadSchemaResponse {

  /**
   * Creates an instance of BadSchemaResponse.
   *
   * @param {Object} schemaResponse - The response object from a schema validation.
   *   Expected to contain an `error` property with a `message`.
   */
  constructor(schemaResponse) {
    this.success = false;
    this.statusCode = 400;
    this.message = schemaResponse?.error?.message;
  }
}

module.exports = {
  BadSchemaResponse
}