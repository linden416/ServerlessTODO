import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deletetodo')

import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('deleteTodo fxn')
  logger.info('deleteTodo Event: ', event)

  const userId = getUserId(event)
  console.log('UserId: ', userId)

  // TODO: Remove a TODO item by id
  // Get todoId from event
  //"pathParameters": {
  //  "todoId": "70664455-1cc7-4581-9b51-cca8fcde0c30"
  //}
  const todoId: string = event.pathParameters.todoId
  console.log("Delete TodoId: ", todoId)
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
        'Access-Control-Allow-Origin': '*'
      },
      body: "TODO belongs to different user"
    }
  }

  var createdAt:string = result.Items[0].createdAt
  const result2 = await docClient.delete({
    TableName: todosTable,
    Key: {
        todoId: todoId,
        createdAt: createdAt
    }
  }).promise()
  logger.info(result2)

  console.log("Success 200")
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: "Deleted"
  }
}
