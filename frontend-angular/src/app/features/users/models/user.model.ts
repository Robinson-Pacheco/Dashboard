export interface User {
  id: string;
  username: string;
  email: string;
  names: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  names: string;
  role?: 'admin' | 'analyst' | 'viewer';
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  email?: string;
  names?: string;
  role?: 'admin' | 'analyst' | 'viewer';
}