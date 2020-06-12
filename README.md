# Udacity Cloud Developer Program #
## Project 4 - Serverless TODO Application utilizing Amazon AWS to support the backend ##
### Gordon Seeler ###
##### Date ####
Jun 11, 2020
#### Summary ####
The **Serverless TODO Application** is a simple TODO application using AWS Lambda and Serverless framework.

#### Description ####
The **Serverless Framework** open source deployment software is implemented within a Node.js Express application. It is Infrastructure Code (IaC) which builds all the functions, resources, and permissions in a cloud. In this application, **Amazon AWS** is the cloud supporting the backend. A provided **Angular React** client UI has been provided with hooks to the cloud endpoints. 

The **Serverless TODO** app employs the third party service **Auth0** as an Identity Provider. It authenticates, generates a signed token, and provides an accessible endpoint for dynamically capturing the certificate required by the backend **AWS API Gateway** for it's custom authenticator. This custom authenticator uses the "sig" from the token to determine which of the several certificates is needed to check the validity of the signed token. For authenticated tokens, a time limited policy is generated allowing the user to access the available API resources. See screenimage 'Jwt io view of a signed token.png' for a view of a translated token generated in my testing using a **Google** account.

The API resources are supported by **AWS Lambda Functions** written in Node.js. These functions share a common api module called **api/db_access.ts** (See screenimage 'DB code separation.png'). This module provides all the interfacing with **AWS DynamoDB** making the functions cleaner to read, better to manage for business functionality. Every function employs ASYNC/AWAIT and PROMISE. All data access with **DynamoDB** is performed with Query only. The TODOs table has a local secondary index which features fast access to the data without any table scans.

Data is secured for a given user only. Multiple users can see and update their own TODOs. (See screenimage '2 Different Account Views.png')

Data validation is setup for creating a new task. Anything except the expected name and dueDate will produce a 400 Bad Request. (See screenimage 'RequestValidation.png')

The client's config.ts file has been updated with both my apiId, apiEndpoint, Auth0 domain and client id. (see screenimage 'Client config update.png')


* * *

#### GitHub Repository ####
https://github.com/linden416/ServerlessTODO.git

This is the source repository for my ServerlessTODO application. 
The following directories are defined within the **ServerlessTODO** root directory:
- **backend** `<-- All the Node.js Express code for building serverless Lambda functions in AWS. Also contains Serverless.yaml`
- **client** `<-- Provided Angular React code configured to run on port 3000 of the local host. My settings updated in config.ts`
- **Screenshots** `<-- Supporting screenshots of full functioning application`
- **CloudwatchLogs** `<-- Sample exported AWS Cloudwatch logs supporting Lambda functions`


* * *


#### Config.ts ####
```
const apiId = '1qkgpbpdnf'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-wmbxg6y0.auth0.com',            // Auth0 domain
  clientId: 'rciXaLEQgZMYVMsQ49WqCs0dsm1oX1OO',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
```

* * *

#### Proof of Working Solution ####
If you refer to my git repository's **screenimages** directory, I have provided 12 .png images showing proof of the following:
1) 'IAM Lambda Roles.png' - This shows roles generated with least privlege for each Lambda function.
2) 'UI Splash page.png' - Shows my UI page after logging in with one of my two Google accounts.
3) '2 Different Account Views' - Shows two separate browsers running the client with different Google accounts.
4) 'Db code separation.png' - Shows code separation and the use of DynamoDB Query
5) 'Jwt.io view of signed token.png' - Shows a decryped token I received from Auth0
6) 'RequestValidation.png' - Shows Postman response for an invalid create TODO request
7) 'S3 ServerlessTODO Bucket.png' - Shows the images loaded into the bucket from the application.
8) 'DynamoDB TODOs.png' - Shows the DynamoDB console for the backend TODOs database
9) 'API Gateway.png' - Shows the API Resources created by the Serverless Framework deployment
10) 'Custom Authorizer.png' - Shows the Custom Authorizer configured the API Gateway

If you refer to the **CloudwatchLogs**, you will see three exported logs showing logging employed by the Lambda function. This
logging is describing the flow and data movement through the an execution of a given Lambda function. An absolute necessity for monitoring and troubleshooting. There is a log for each function and custom authorizer, but I provided several.

* * *
### Installation:
I have my backend API services up and running. My application was deployed to the US-EAST-1 N. Virginia region. I have updated the client config.ts in my git repository.


## References
[DynamoDB: Understanding Query and Scan Operations](http://techtraits.com/cloud/nosql/2012/06/28/Amazon-DynamoDB-Understanding-Query-and-Scan-operations.html#:~:text=A%20query%20operation%20as%20specified%20in%20DynamoDb%20documentation%3A&text=A%20query%20operation%20uses%20the,then%20filters%20the%20results%20afterwards.)

[How to make remote REST call inside Node.js? any CURL?](https://gist.github.com/michelbl/cd9fa23968c7554b76567e3c093c9415)

[Making HTTPS requests with nodejs](https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/#environment-variables)

[AWS DynamoDb delete item using primary and sort key](https://stackoverflow.com/questions/48925284/aws-dynamodb-delete-item-using-primary-and-sort-key)

[Navigating RS256 and JWKS](https://auth0.com/blog/navigating-rs256-and-jwks/)

[Node.js v14.4.0 Documentation](https://nodejs.org/api/https.html)

[JWT](https://jwt.io/)

[Querying and Scanning an Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.Indexes.QueryAndScan.html)

[Query Data in a Table](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-5.html)

