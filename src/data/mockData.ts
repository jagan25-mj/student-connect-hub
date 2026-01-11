import { User, Post } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'founder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@minihub.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    createdAt: new Date('2024-01-01'),
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'project',
    title: 'AI-Powered Study Assistant',
    description: 'Building a smart study companion that uses machine learning to create personalized study plans and quizzes based on your learning style and progress.',
    author: mockUsers[0],
    createdAt: new Date('2024-12-01'),
    tags: ['AI', 'EdTech', 'React'],
    likes: 42,
    comments: 12,
  },
  {
    id: '2',
    type: 'hackathon',
    title: 'TechCrunch Disrupt Hackathon 2025',
    description: 'Join us for a 48-hour hackathon focused on building solutions for climate change. $50,000 in prizes and mentorship from top VCs.',
    author: mockUsers[1],
    createdAt: new Date('2024-12-10'),
    tags: ['Hackathon', 'Climate', 'Prizes'],
    likes: 156,
    comments: 45,
  },
  {
    id: '3',
    type: 'internship',
    title: 'Frontend Engineering Intern - Stripe',
    description: 'Exciting opportunity to work on Stripe\'s checkout experience. Looking for students passionate about building beautiful, accessible interfaces.',
    author: mockUsers[1],
    createdAt: new Date('2024-12-15'),
    tags: ['Frontend', 'Fintech', 'Remote'],
    likes: 89,
    comments: 23,
  },
  {
    id: '4',
    type: 'project',
    title: 'Open Source Campus Navigator',
    description: 'An open-source mobile app helping students navigate campus, find study spots, and connect with classmates in real-time.',
    author: mockUsers[0],
    createdAt: new Date('2024-12-18'),
    tags: ['Mobile', 'Open Source', 'Maps'],
    likes: 67,
    comments: 18,
  },
  {
    id: '5',
    type: 'hackathon',
    title: 'MLH Local Hack Day',
    description: 'A beginner-friendly hackathon for students new to coding. Build your first project with workshops and peer support!',
    author: mockUsers[0],
    createdAt: new Date('2024-12-20'),
    tags: ['Beginner', 'MLH', 'Learning'],
    likes: 234,
    comments: 67,
  },
];

// Mock credentials for demo
export const mockCredentials = [
  { email: 'student@demo.com', password: 'demo123', user: mockUsers[0] },
  { email: 'founder@demo.com', password: 'demo123', user: mockUsers[1] },
  { email: 'admin@demo.com', password: 'demo123', user: mockUsers[2] },
];
