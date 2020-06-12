import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger'
const logger = createLogger('createtodo')
import { addTODO } from '../../api/db_access'
import { TodoItem } from '../../models/TodoItem';
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('createTodo fxn')
  logger.info('createTodo Event: ', event)
  try {
    const userId = getUserId(event)
    console.log('UserId: ', userId)
  
    //Validate input
    const todoData: CreateTodoRequest = JSON.parse(event.body)
    if (todoData.name == null || todoData.name == undefined || todoData.name.length == 0) { 
      throw new Error("Missing required data TODO name")
    }
    else if (todoData.dueDate == null || todoData.dueDate == undefined || todoData.dueDate.length == 0) { 
      throw new Error("Missing required data TODO dueDate")
    }

    //Add new todo
    const item: TodoItem = await addTODO(userId, event.body)
  
    console.log("Success 201")
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ item })
    }
  } catch(e) {
    logger.error('Exception:', e.message)
    var codeStatus = 500 //Unexpected server error default
    if (e.message.includes('Missing required data'))
        codeStatus = 400 //Bad Request
    return {
      statusCode: codeStatus,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: e.message
    }
  }
  
}

