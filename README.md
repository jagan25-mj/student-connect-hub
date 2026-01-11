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

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Login |
| GET | `/api/v1/auth/me` | Protected | Get current user |
| GET | `/api/v1/posts` | Public | List posts |
| POST | `/api/v1/posts` | Protected | Create post |
| DELETE | `/api/v1/posts/:id` | Admin | Delete post |

## 🔐 Security Features

- JWT authentication (24h expiration)
- bcrypt password hashing
- Rate limiting on auth routes
- Helmet security headers
- Input validation
- CORS restrictions in production
- Sanitized error messages

## 👥 User Roles

- **Student**: Browse, create posts
- **Founder**: Same as student
- **Admin**: Full access + moderation

## 📦 Production URLs

- **Frontend**: [Your Vercel URL]
- **Backend**: [Your Render/Railway URL]

## 📝 License

MIT
