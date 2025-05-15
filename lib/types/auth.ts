export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
