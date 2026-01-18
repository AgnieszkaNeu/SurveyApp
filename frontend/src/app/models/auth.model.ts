export interface LoginCredentials {
  username: string;
  password: string;
}


export interface Token {
  access_token: string;
  token_type: string;
}


export interface EmailRequest {
  email: string;
  token?: string;
}


export interface PasswordResetRequest {
  token: string;
  new_password: string;
}
