import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  type ISignUpResult,
} from 'amazon-cognito-identity-js';

import { getUserPool } from '@/services/cognitoConfig';

export type CognitoSessionTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

function userForEmail(email: string): CognitoUser {
  const trimmed = email.trim().toLowerCase();
  return new CognitoUser({
    Username: trimmed,
    Pool: getUserPool(),
  });
}

/**
 * Sign in with email + password (SRP). Pool must allow USER_SRP_AUTH on the app client.
 */
export function signInWithEmailPassword(
  email: string,
  password: string
): Promise<CognitoSessionTokens> {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email.trim().toLowerCase(),
      Password: password,
    });
    const cognitoUser = userForEmail(email);
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export type SignUpResult = {
  userSub: string;
  userConfirmed: boolean;
};

/**
 * Public self-sign-up. Email is used as the Cognito username (typical for email-as-username pools).
 */
export function signUpWithEmailPassword(
  email: string,
  password: string,
  displayName: string
): Promise<SignUpResult> {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email.trim().toLowerCase() }),
    ];
    const name = displayName.trim();
    if (name) {
      attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: name }));
    }
    getUserPool().signUp(
      email.trim().toLowerCase(),
      password,
      attributeList,
      [],
      (err: Error | undefined, result?: ISignUpResult) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result?.userSub) {
          reject(new Error('Sign up returned no userSub'));
          return;
        }
        resolve({
          userSub: result.userSub,
          userConfirmed: result.userConfirmed,
        });
      }
    );
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userForEmail(email);
    cognitoUser.confirmRegistration(code.trim(), true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function resendSignUpCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userForEmail(email);
    cognitoUser.resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
