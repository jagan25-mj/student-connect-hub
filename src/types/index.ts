export type UserRole = 'student' | 'founder' | 'admin';

export type PostType = 'project' | 'hackathon' | 'internship';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isEmailVerified?: boolean;
  createdAt: Date;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
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
  likedBy?: string[];
  commentsList?: Comment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

