import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-wmbxg6y0.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  console.log("verifyToken")
  console.log("authHeader: ", authHeader)
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  //E.g. User:  { alg: 'RS256', typ: 'JWT', kid: 'I1h_DMP0_P8B0WoUlBpcH' }
  console.log("User: ", jwt.header)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log("Calling AUTH0...")
  const jwksdata = await getAuth0_JSON_WebKeys()
  console.log("AUTH0 jwks response: ", jwksdata)
  const cert = extractCertFromKeys(jwt.header.kid, jwksdata)
  const certPem: string = certToPEM(cert)
  console.log("Cert: ", certPem)

  const jtoke = verify(
    token,           // Token from an HTTP header to validate
    certPem,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
  console.log("verfy jtoke: ", jtoke.sub)
  return jtoke
}

//Access the Auth0 Endpoint service to obtain certificate
async function getAuth0_JSON_WebKeys():Promise<string> {
  console.log("getCert")
  const https = require('https')
  return new Promise((resolve, reject) => {
    https.get(jwksUrl, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve(body)
      })
    }).on('error', (e) => {
      reject(Error(e))
    })
  });
}

//Extract user token from header
function getToken(authHeader: string): string {
  console.log("getToken")
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

//Use the kid extracted from the token to identify the appropriate
//certificate key from the data returned from Auth0
function extractCertFromKeys(kid: string, jwksdata: string): string{
  console.log("extractCertFromKeys")
  let cert: string = null 
  /* Example Auth0 response
  keys: [
    {
      alg: 'RS256',
      kty: 'RSA',
      use: 'sig',
      n: '2qyuHq9tQSBW9dla1t-XwupZiEgOc9FXUjdO8FyYnL5YB7VWEKLpCuWwEKC5p-nvohKxu6eB...',
      e: 'AQAB',
      kid: 'I1h_DMP0_P8B0WoUlBpcH',
      x5t: '-Bsv6ndf4jMIzSpo1cRI8hmifIA',
      x5c: [Array]
    },
    {
      alg: 'RS256',
      kty: 'RSA',
      use: 'sig',
      n: 'wwhDczQ6DGr7GHMaphXgFHTi40OkKw7Id6wf_d8zywJnaoc_Ik89NKRO5ZZsKi247FsY28YyS...',
      e: 'AQAB',
      kid: 'XLP7BPozln6jy8s7WU81c',
      x5t: '7cywQsiBHanHjJ2KprPUpM2InLI',
      x5c: [Array]
    }
  ]
  */
  const jwksKeys = JSON.parse(jwksdata)
  console.log("matching kid: ", kid)

  for (const ix in jwksKeys.keys) {  
    if (jwksKeys.keys[ix].kid == kid) {
      cert = jwksKeys.keys[ix].x5c[0]
      break
    }
  }
  return cert
}

//Format the cert into PEM
function certToPEM(cert: string): string {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}