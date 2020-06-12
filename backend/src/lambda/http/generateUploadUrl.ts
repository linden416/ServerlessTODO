import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

import { imageUpdTODO } from '../../api/db_access'
import { getUserId } from '../utils'
import * as uuid from 'uuid'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('generateUploadUrl fxn')
  logger.info('generateUploadUrl Event: ', event)
  try {
    const userId = getUserId(event)
    console.log('UserId: ', userId)
  
    const todoId: string = event.pathParameters.todoId
  
    //Get a signedURL from S3 for a new image
    const imageId: string = uuid.v4()
    console.log("Create signedURL S3 PutObject")
    const signedURL = getUploadUrl(imageId)
    console.log("Signed URL:\n", signedURL)
  
    const imgurl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    await imageUpdTODO(userId, todoId, imgurl)
  
    console.log("Success 200")
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({uploadUrl: signedURL})
    }
  } catch(e) {
    logger.error('Exception:', e.message)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: e.message
    }
  }
}

// Create a signedURL in S3 bucket to put new object
function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}