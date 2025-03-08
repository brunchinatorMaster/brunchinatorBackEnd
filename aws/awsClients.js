const {
  PutObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
  S3ServiceException,
} = require("@aws-sdk/client-s3");
const { config } = require('./awsconfig');

const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  }
});
const USER_PROFILE_IMAGES_BUCKET = 'brunchinator-user-profile-pictures';
const REVIEW_IMAGES_BUCKET = 'brunchinator-review-images';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  TransactWriteCommand,
  DynamoDBDocumentClient
} = require("@aws-sdk/lib-dynamodb");

const dynamodb = new DynamoDBClient({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  }
});

const docClient = DynamoDBDocumentClient.from(dynamodb);

module.exports = {
  dynamodb,
  docClient,
  PutCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  TransactWriteCommand,
  s3Client,
  PutObjectCommand,
  S3ServiceException,
  USER_PROFILE_IMAGES_BUCKET,
  REVIEW_IMAGES_BUCKET
}