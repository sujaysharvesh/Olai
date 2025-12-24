

export interface TextBox {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
}

export interface AuthRequest {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface JwtPayLoad {
  id: string;
  username: string;
  email: string;
}

export interface User {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date;
}

export interface LoginResponse {
  token: string;
  user: User;
}
