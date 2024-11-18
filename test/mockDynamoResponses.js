const mockGenericDynamoError = new Error('Exception: Some Indeterminite Dynamo Error');

mockGenericDynamoError.$metadata = {
  httpStatusCode: 403,
  requestId: 'CLUJ5E6ERJ69OOUPSTVDDIALHVVV4KQNSO5AEMVJF66Q9ASUAAJG',
  extendedRequestId: undefined,
  cfId: undefined,
  attempts: 1,
  totalRetryDelay: 0
}


module.exports = {
  mockGenericDynamoError
}