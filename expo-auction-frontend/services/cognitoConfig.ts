import { CognitoUserPool } from 'amazon-cognito-identity-js';

const region = process.env.EXPO_PUBLIC_COGNITO_REGION;
const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;

export function getCognitoPoolConfig(): {
  UserPoolId: string;
  ClientId: string;
} {
  if (!region || !userPoolId || !clientId) {
    throw new Error(
      'Missing Cognito env: EXPO_PUBLIC_COGNITO_REGION, EXPO_PUBLIC_COGNITO_USER_POOL_ID, EXPO_PUBLIC_COGNITO_CLIENT_ID'
    );
  }
  return { UserPoolId: userPoolId, ClientId: clientId };
}

let pool: CognitoUserPool | null = null;

export function getUserPool(): CognitoUserPool {
  if (!pool) {
    pool = new CognitoUserPool(getCognitoPoolConfig());
  }
  return pool;
}
