export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  names: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  names: string;
  role?: 'admin' | 'analyst' | 'viewer';
}