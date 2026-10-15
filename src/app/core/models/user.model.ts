export interface AlumniUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  rollNumber?: string;
  batch?: string;
  department?: string;
  role?: 'alumni' | 'admin' | 'student';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AlumniUser | null;
  token?: string | null;
}
