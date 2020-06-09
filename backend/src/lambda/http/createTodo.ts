import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createtodo')

import * as uuid from 'uuid'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('createTodo fxn')
  logger.info('createTodo Event: ', event)

  const userId = getUserId(event)
  console.log('UserId: ', userId)

  // TODO: Implement creating a new TODO item
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const item: TodoItem = {
    todoId: uuid.v4(),
    userId: userId,
    createdAt: new Date().toISOString(),
    name: newTodo.name,
    dueDate: newTodo.dueDate,
    done: false
  }  
  logger.info(item)

  await docClient.put({
      TableName: todosTable,
      Item: item
  }).promise()
  
  console.log("Success 201")
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ item })
  }
}
