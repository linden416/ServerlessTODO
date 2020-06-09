import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

import { getUserId } from '../utils'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('generateUploadUrl fxn')
  logger.info('generateUploadUrl Event: ', event)

  const userId = getUserId(event)
  console.log('UserId: ', userId)

  const todoId: string = event.pathParameters.todoId
  const result = await docClient.scan({
    TableName: todosTable,
    FilterExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  if (result.Items[0].userId != userId){
    console.log("403 Forbidden, Todo Task belongs to different user: ", result.Items[0].userId)
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: "TODO belongs to different user"
    }
  }
  //----------

  const imageId: string = uuid.v4()
  const signedURL = getUploadUrl(imageId)

  //----------
  const createdAt: string = result.Items[0].createdAt
  const key = {"todoId": todoId, "createdAt": createdAt}
  const imgurl = `https://${bucketName}.s3.amazonaws.com/${imageId}`  
  var params = {
    TableName:'TODOs-dev',
    Key: key,
    UpdateExpression: "SET #attach = :imgurl",
    ExpressionAttributeNames:{
        "#attach": "attachmentUrl"
    },
    ExpressionAttributeValues:{
       ":imgurl": imgurl
    },
    ReturnValues:"ALL_NEW"
  };
  console.log("Updating TODO with image url: ", imgurl)
  const result2 = await docClient.update(params).promise()
  console.log(result2)

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  console.log("Success 200")
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({uploadUrl: signedURL})
  }
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}