export interface User {
  id: string;
  name: string;
  email: string;
  role: 'analyst' | 'admin';
  initials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
