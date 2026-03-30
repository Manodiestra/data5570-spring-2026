import requests
from jose import jwt
from jose.exceptions import JWTError, ExpiredSignatureError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os
from functools import lru_cache

def get_cognito_config():
    """Get Cognito configuration from environment variables."""
    region = os.environ.get('COGNITO_REGION')
    user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
    app_client_id = os.environ.get('COGNITO_APP_CLIENT_ID')
    return region, user_pool_id, app_client_id


class CognitoUser:
    def __init__(self, claims):
        self.claims = claims
        self.username = claims.get("email") or claims.get("cognito:username")
        self.sub = claims.get("sub")

    @property
    def email(self):
        e = self.claims.get("email")
        return e if isinstance(e, str) else None

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.username or self.sub or "CognitoUser"


@lru_cache(maxsize=8)
def _fetch_jwks(jwks_url: str):
    resp = requests.get(jwks_url, timeout=5)
    resp.raise_for_status()
    jwks = resp.json()
    if "keys" not in jwks:
        raise AuthenticationFailed(f"Invalid JWKS response: {jwks}")
    return jwks


class CognitoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Get Cognito configuration from environment variables
        COGNITO_REGION, USER_POOL_ID, APP_CLIENT_ID = get_cognito_config()
                
        # Validate that environment variables are set
        if not COGNITO_REGION or not USER_POOL_ID or not APP_CLIENT_ID:
            raise AuthenticationFailed('Cognito configuration is missing. Please set COGNITO_REGION, COGNITO_USER_POOL_ID, and COGNITO_APP_CLIENT_ID environment variables.')
        
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            # First, decode without verification to check token type and audience
            unverified_claims = jwt.get_unverified_claims(token)
            token_use = unverified_claims.get('token_use')
            
            if token_use not in ("id", "access"):
                raise AuthenticationFailed(f'Invalid token type. Expected "id" or "access", got: {token_use}')

            # Cognito ID token uses "aud"; access token uses "client_id"
            token_client_id = unverified_claims.get("aud") if token_use == "id" else unverified_claims.get("client_id")
            if token_client_id and token_client_id != APP_CLIENT_ID:
                raise AuthenticationFailed("Token was not issued for this app client.")
            
            jwks_url = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'
            jwks = _fetch_jwks(jwks_url)
            
            headers = jwt.get_unverified_header(token)
            key = next((k for k in jwks['keys'] if k['kid'] == headers['kid']), None)
            if not key:
                raise AuthenticationFailed('Public key not found.')

            decode_kwargs = dict(
                token,
                key,
                algorithms=['RS256'],
                issuer=f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USER_POOL_ID}',
            )
            if token_use == "id":
                decode_kwargs["audience"] = APP_CLIENT_ID
            payload = jwt.decode(**decode_kwargs)

            return (CognitoUser(payload), None)

        except ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except requests.RequestException as e:
            raise AuthenticationFailed(f'Failed to fetch JWKS: {str(e)}')
        except JWTError as e:
            raise AuthenticationFailed(f'JWT error: {str(e)}')
