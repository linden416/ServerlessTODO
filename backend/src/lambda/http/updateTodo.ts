import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodoUpdate } from '../../models/TodoUpdate'
const logger = createLogger('upatetodo')

import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('updateTodo fxn')
  logger.info('updateTodo Event: ', event)

  const userId = getUserId(event)
  console.log('UserId: ', userId)

  const todoId: string = event.pathParameters.todoId
 
  console.log("Update TodoId: ", todoId)
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

  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const updItem: TodoUpdate = {
    name: updatedTodo.name,
    dueDate: updatedTodo.dueDate,
    done: updatedTodo.done
  }  
  logger.info(updItem)

  const createdAt:string = result.Items[0].createdAt
  const params = {
    TableName: todosTable,
    Key: {
      todoId: todoId,
      createdAt: createdAt
    },
    UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeNames:{
        "#name": "name"
    },
    ExpressionAttributeValues:{
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
    },
    ReturnValues:"ALL_NEW"
  };
  const result2 = await docClient.update(params).promise()
  const updatedItem = JSON.stringify(result2.Attributes)
  logger.info(updatedItem)
  
  console.log("Success 200")
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: updatedItem
  }
}
