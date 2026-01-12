# MiniHub - Student Collaboration Platform

A full-stack platform for students to collaborate on projects, discover hackathons, and find internship opportunities.

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Framer Motion** (animations)
- **React Router** (routing)
- **Axios** (API calls)

### Backend
- **Node.js** + Express.js
- **TypeScript**
- **MongoDB Atlas** + Mongoose
- **JWT** + bcrypt (auth)
- **Helmet** (security headers)
- **express-rate-limit** (rate limiting)

## 🏗️ Architecture

```
student-connect-hub/
├── src/                    # Frontend (React)
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── pages/
│   └── types/
├── backend/                # Backend (Express)
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       └── utils/
└── README.md
```

## ✅ Features

### Core Features
- ✅ User authentication (register/login)
- ✅ Post creation (projects, hackathons, internships)
- ✅ Like and comment on posts
- ✅ Admin moderation dashboard
- ✅ Responsive design

### Recently Added
- ✅ **Edit Profile** - Update name and bio
- ✅ **Forgot/Reset Password** - Secure password recovery flow
- ✅ **Edit/Delete Posts** - Authors and admins can modify posts
- ✅ **Post Detail Page** - Full post view with all comments
- ✅ **User Search** - Search for users by name or email
- ✅ **Email Verification** - Token-based verification (logged to console)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Environment Variables

**Backend (`backend/.env`):**
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/minihub
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env`):**
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### Running Locally

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/v1/health

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Login |
| GET | `/api/v1/auth/me` | Protected | Get current user |
| POST | `/api/v1/auth/forgot-password` | Public | Request password reset |
| POST | `/api/v1/auth/reset-password/:token` | Public | Reset password |
| GET | `/api/v1/auth/verify-email/:token` | Public | Verify email |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/api/v1/users/me` | Protected | Update profile |
| GET | `/api/v1/users?search=` | Protected | Search users |

### Posts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/posts` | Public | List posts |
| GET | `/api/v1/posts/:id` | Public | Get single post |
| POST | `/api/v1/posts` | Protected | Create post |
| PUT | `/api/v1/posts/:id` | Protected | Update post (author/admin) |
| DELETE | `/api/v1/posts/:id` | Protected | Delete post (author/admin) |
| POST | `/api/v1/posts/:id/like` | Protected | Like/unlike post |
| POST | `/api/v1/posts/:id/comments` | Protected | Add comment |

## 🔐 Security Features

- JWT authentication (24h expiration)
- bcrypt password hashing
- Secure password reset tokens (1h expiry)
- Rate limiting on auth routes
- Helmet security headers
- Input validation with express-validator
- CORS restrictions in production
- Sanitized error messages

## 👥 User Roles

- **Student**: Browse, create, edit/delete own posts
- **Founder**: Same as student
- **Admin**: Full access + moderation of all posts

## 📝 License

MIT

