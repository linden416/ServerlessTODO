import * as AWS from 'aws-sdk'

import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('db_access_Logger')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosIndex = process.env.INDEX_NAME

export async function getTODO(userId: string, todoId: string): Promise<TodoItem> {
  console.log('db_access.getTODO')
  console.log("Query Todo filter by todoId: ", todoId)
  console.log("Key: ", userId + ' ' + todoId)
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: todosIndex,
    KeyConditionExpression: 'userId = :userId and todoId = :todoId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':todoId': todoId
    } 
  }).promise()
  logger.info('getTodo Q Result', result)
  const item = result.Items[0]
  logger.info('Item: ', item)
  const todo: TodoItem = JSON.parse(JSON.stringify(item)) //JSON.parse(result.Items[0].item)
  console.log('Get TODO: ', todo)
  return todo
}

export async function getTODOs(userId: string): Promise<string> {
    console.log('db_access.getTODOs')
    console.log("Query Todos filter by userId: ", userId)

    const result = await docClient.query({
      TableName: todosTable,
      IndexName: todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      } 
    }).promise()
    console.log('Get TODOs: ', result.Items)
    
    return JSON.stringify(result.Items)
  }

export async function addTODO(userId: string, data: string): Promise<TodoItem> {
  console.log('db_access.addTODO')
  console.log("Add new Todo for User: ", userId)
  
  const todoData: CreateTodoRequest = JSON.parse(data)
  const newItem: TodoItem = {
    todoId: uuid.v4(),
    userId: userId,
    createdAt: new Date().toISOString(),
    name: todoData.name,
    dueDate: todoData.dueDate,
    done: false
  }  
  logger.info('New Todo', newItem)
  
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()
  console.log('Ok')

  return newItem
}

export async function delTODO(userId: string, todoId: string): Promise<void> {
  console.log('db_access.getTODO')
  console.log("Delete Todo: ", todoId)

  console.log("Query Todo")
  const todo = await getTODO(userId, todoId)  //Get the todo 

  console.log("Key: ", userId + ' ' + todo.createdAt)
  const result = await docClient.delete({
    TableName: todosTable,
    Key: {
      userId: userId,
      createdAt: todo.createdAt
    }
  }).promise()
  console.log('Ok ', result)
  return
}

export async function updTODO(userId: string, todoId: string, data: string): Promise<string> {
  console.log('db_access.updTODO')
  console.log("Update a Todo's Done attr, todoId: ", todoId)

  console.log("Query Todo")
  const todo = await getTODO(userId, todoId)  //Get the todo 

  const updData: UpdateTodoRequest = JSON.parse(data)

  console.log("Key: ", userId + ' ' + todo.createdAt)
  console.log("Done: ", updData.done)
  const params = {
    TableName: todosTable,
    Key: {
      userId: userId,
      createdAt: todo.createdAt,
    },
    UpdateExpression: "set done = :done",
    ExpressionAttributeValues:{
      ":done": updData.done
    },
    ReturnValues:"ALL_NEW"
  };
  const result = await docClient.update(params).promise()   //Update it
  const updatedItem = JSON.stringify(result.Attributes)
  logger.log('Updated', updatedItem)
  console.log('Ok')
  return updatedItem
}

export async function imageUpdTODO(userId: string, todoId: string, imgurl: string): Promise<void> {
  console.log('db_access.imageUpdTODO')
  console.log("Update Todo with S3 image url: ", todoId)

  console.log("Query Todo")
  const todo = await getTODO(userId, todoId)  //Get the todo 

  console.log("Key: ", userId + ' ' + todo.createdAt)
  console.log("Image URL: ", imgurl)
  const params = {
    TableName: todosTable,
    Key: {
      userId: userId,
      createdAt: todo.createdAt,
    },
    UpdateExpression: "SET #attach = :imgurl",
    ExpressionAttributeNames:{
        "#attach": "attachmentUrl"
    },
    ExpressionAttributeValues:{
       ":imgurl": imgurl
    },
    ReturnValues:"ALL_NEW"
  };
  const result2 = await docClient.update(params).promise()
  const updatedItem = JSON.stringify(result2.Attributes)
  console.log('Updated:\n', updatedItem)
  return
}