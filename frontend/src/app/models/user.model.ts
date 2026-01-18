export interface User {
  email: string;
  created_at: Date;
}


export interface UserCreate {
  email: string;
  password: string;
}


export interface UserUpdate {
  password?: string;
}


export enum Role {
  USER = 'user',
  SUPERUSER = 'superuser'
}
