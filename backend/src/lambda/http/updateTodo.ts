import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
const logger = createLogger('upatetodo')
import { updTODO } from '../../api/db_access'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('updateTodo fxn')
  logger.info('updateTodo Event: ', event)
  try {
    const userId = getUserId(event)
    console.log('UserId: ', userId)
  
    const todoId: string = event.pathParameters.todoId
    console.log("Update TodoId: ", todoId)
    const updatedItem = await updTODO(userId, todoId, event.body)
  
    console.log("Success 200")
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: updatedItem
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

