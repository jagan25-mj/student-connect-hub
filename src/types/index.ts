export type UserRole = 'student' | 'founder' | 'admin';

export type PostType = 'project' | 'hackathon' | 'internship';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  author: User;
  createdAt: Date;
  tags?: string[];
  likes: number;
  comments: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
