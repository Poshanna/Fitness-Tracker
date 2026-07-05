# AegisFit - Fitness Management Platform

### 🚀 Live Deployments
- 🌐 **Live Web Application (Vercel)**: [https://fitness-tracker-bice-zeta.vercel.app/](https://fitness-tracker-bice-zeta.vercel.app/)
- ⚙️ **Production API Backend (Render)**: [https://fitness-tracker-backend-mfcl.onrender.com/](https://fitness-tracker-backend-mfcl.onrender.com/)

---

AegisFit is a production-ready, premium full-stack web application designed for tracking workouts, nutrition macros, water intake, daily steps, and biometrics. It incorporates a professional dark/light theme, custom Recharts analytics, and an integrated AI Coach powered by the Google Gemini API (with robust offline mockup fallbacks).

---

## Technical Stack

### Frontend (Single Page Application)
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS v4 (with modern theme variables & Outfit typography)
- **Routing**: React Router v6
- **HTTP Client**: Axios (with interceptors for JWT automatic refreshing)
- **State & Form**: React Hook Form, React Context
- **Visual Charts**: Recharts
- **Animations**: Framer Motion & CSS keyframe micro-transitions

### Backend (REST API)
- **Runtime**: Node.js & Express.js
- **ORM**: Prisma ORM
- **Database**: PostgreSQL (Neon Serverless or Local instance)
- **Security**: JWT tokens, bcrypt, Helmet headers, CORS filters, and Express Rate Limit
- **Validation**: Express Validator middleware
- **Uploads**: Multer image processing

---

## Folder Structure

```
Fitness Tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Normalized Database Schema (Prisma)
│   ├── src/
│   │   ├── controllers/       # Business logic handlers (auth, analytics, AI, meals)
│   │   ├── middleware/        # JWT auth, Multer upload, validators, rate limiters
│   │   ├── routes/            # Express routers mounting controllers
│   │   ├── services/          # Gemini AI integrations & database seed helpers
│   │   ├── app.js             # Express core setup & middleware bindings
│   │   └── server.js          # Startup entry-point (binds PORT & runs seeder)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, Navbars, and App layouts
│   │   ├── context/           # ThemeContext (dark/light) & AuthContext (JWT sessions)
│   │   ├── pages/             # Dashboard, Workouts, Nutrition, Goals, Analytics, AI, Admin, Login, Register
│   │   ├── services/          # Axios client instance with token interceptors
│   │   ├── App.jsx            # Core routing bindings
│   │   ├── index.css          # Tailwind CSS v4 directives & fonts
│   │   └── main.jsx           # Mounting entry
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml         # Spawns PostgreSQL locally
└── README.md                  # Detailed Documentation (This file)
```

---

## Environment Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file under the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitnesstracker?schema=public"
JWT_SECRET="supersecretaccessjwtkey_987654321_fitness"
JWT_REFRESH_SECRET="supersecretrefreshjwtkey_123456789_fitness"
GEMINI_API_KEY="your_google_gemini_api_key" # If empty, the app uses detailed mock data fallbacks
NODE_ENV="development"
```

### Frontend Configuration
The frontend automatically proxies requests from `/api` to the backend on `http://localhost:5000` via its `vite.config.js` proxy configuration.

---

## Installation & Running Guide

### 1. Spawning PostgreSQL Database
If you have Docker installed, you can spin up PostgreSQL in the background:
```bash
docker-compose up -d
```
Alternatively, configure the `DATABASE_URL` in `backend/.env` with your Neon PostgreSQL URL or any running PostgreSQL connection string.

### 2. Bootstrapping Backend
Navigate to the `backend/` directory, install packages, compile the database tables, and run the server:
```bash
cd backend
npm install
npx prisma db push # Pushes the normalized schema to your PostgreSQL database
npm run dev
```
*Note*: On boot, if the `Exercise` table is empty, the server automatically seeds 12 standard workouts into the Exercise Library.

### 3. Bootstrapping Frontend
Open another terminal, navigate to `frontend/`, install packages, and boot the development server:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## API Documentation

### Authentication & Profile
- `POST /api/auth/register` - Create user account. Returns access & refresh tokens.
- `POST /api/auth/login` - Validate credentials and return JWT tokens.
- `POST /api/auth/refresh` - Submit refresh token to acquire a new access token.
- `POST /api/auth/logout` - Clear sessions.
- `GET /api/user/profile` - Retrieve user profile + auto-calculated BMI, BMR, and Daily Calorie targets.
- `PUT /api/user/profile` - Update age, weight, goal, and profile pictures.

### Workout & Exercise
- `GET /api/workouts` - Fetch logged workouts (filter by date, muscle group, type).
- `POST /api/workouts` - Log workout (takes an array of sets/reps).
- `PUT /api/workouts/:id` - Edit logs.
- `DELETE /api/workouts/:id` - Delete logs.
- `GET /api/exercises` - Query the pre-seeded Exercise library.

### Nutrition, Steps & Water
- `GET /api/meals` - Get food logs for a date.
- `POST /api/meals` - Log meal (Breakfast, Lunch, Dinner, Snacks with individual macro metrics).
- `POST /api/water` - Log water intake.
- `POST /api/steps` - Log step counts.

### Progress & Analytics
- `GET /api/progress` - Fetch historical body weights and chest/waist measurements (weekly/monthly/yearly tabs).
- `POST /api/progress` - Log physical dimensions.
- `GET /api/analytics` - Combined dashboard aggregation (workout frequency, water, steps, streak counts).

### AI Coach Services
- `POST /api/ai/chat` - Talk to the chatbot (maintains history).
- `POST /api/ai/workout-plan` - Request an automated training split.
- `POST /api/ai/nutrition-plan` - Retrieve diet plans.
- `GET /api/ai/insights` - Computes natural-language coach insights from logged metrics.

### Admin Panel
- `GET /api/admin/users` - View users directory.
- `DELETE /api/admin/users/:id` - Delete user.
- `GET /api/admin/chatbot-logs` - Inspect aggregated chatbot session histories.
- `GET /api/admin/analytics` - View general system metrics.

---

## Deployment Instructions

### Database (Neon PostgreSQL)
1. Sign up at [Neon.tech](https://neon.tech/) and spawn a new PostgreSQL serverless database.
2. Copy the Connection String and set it as `DATABASE_URL` in your production environments.

### Backend (Render / Heroku)
1. Create a Web Service on Render connecting to your Git repository's `backend` folder.
2. Set Environment variables matching `backend/.env`.
3. Set the build command to `npm install && npx prisma generate` and the start command to `npm start`.

### Frontend (Vercel / Netlify)
1. Add a project on Vercel, pointing it to your frontend folder.
2. Build commands will default to `npm run build` and output directory to `dist`.
3. Configure redirect rewrites in `vercel.json` to routing fallback files (like `/index.html`) to support client-side React routing.
