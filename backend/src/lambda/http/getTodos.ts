import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('gettodos')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('getTodos lambda fxn')
  logger.info('GetTodos Event: ', event)

  const userId = getUserId(event)
  console.log('UserId: ', userId)

  //TODO-GS I think I want to query here and add the userId to the filter
  const result = await docClient.scan({
    TableName: todosTable,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    }
  }).promise()
  const items = result.Items
  logger.info(items)

  console.log("Success 200")
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }
}
