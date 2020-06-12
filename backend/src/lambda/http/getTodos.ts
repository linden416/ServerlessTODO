import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

import { getUserId } from '../utils'
import { getTODOs } from '../../api/db_access'
import { createLogger } from '../../utils/logger'
const logger = createLogger('gettodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('getTodos lambda fxn')
  logger.info('GetTodos Event: ', event)
  try {
    const userId = getUserId(event)
    console.log('UserId: ', userId)
  
    //Retreive all TODOs for the UserId
    const items = JSON.parse(await getTODOs(userId))
    logger.info(items)
  
    console.log("Success 200")
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({items})
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
