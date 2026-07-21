# ⚡️ Fundo

**Fundo is a college event payment platform for organisers and students.**
It helps organisers create events, collect online payments via Razorpay, and track every transaction in one place.

**Live Demo:** https://fundo-doe.pages.dev/

---

## 🚀 What Fundo Solves

College event payments are often handled with cash, screenshots, and scattered messages.
Fundo provides a single system for:

- Creating event registration pages.
- Collecting payments online via Razorpay.
- Recording payment status and transactions in a PostgreSQL database.
- Real-time dashboard analytics for organizers and administrators.
- Access control validation for event details, profile modifications, and private events.

---

## ✅ Implemented Features

- **Robust Authentication**: JWT access tokens (stored in-memory on the client) and refresh token rotation (stored in secure `HttpOnly` cookies).
- **Google OAuth Login**: Google Social login integration using Passport.js (`passport-google-oauth20`).
- **End-to-End OTP Verification**: Automatically triggers and verifies 6-digit OTPs using Redis cache and Nodemailer on registration/unverified login flows.
- **Event Management**: Create, update, and delete events with dynamic Cloudinary image upload support.
- **Organizer Avatars**: Organizer profiles with customizable avatar uploads, dynamically rendered on all public event cards and details pages.
- **Security Audited (0 Vulnerabilities)**: Upgraded dependencies workspace-wide (including Cloudinary SDK overrides) to achieve zero vulnerabilities under `npm audit`.
- **API Access Control**: Strict token verification and authorization checks to protect event updates/deletes and transactions history.

---

## 🧱 Tech Stack

### Backend
- **Core**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Cache & Verification**: Redis (for OTPs and verified session keys)
- **Payments**: Razorpay Node SDK
- **Uploads**: Multer-Storage-Cloudinary
- **Security**: Helmet, CORS, Express-Rate-Limit, BCryptJS hashing

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS (High-fidelity dark theme)
- **Visuals**: Spline (interactive 3D hero background asset)
- **Animations**: Framer Motion
- **Navigation**: React Router DOM (v7)

---

## 📁 Project Structure

```
fundo/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/       # Passport, Cloudinary, Redis & Razorpay configs
│   │   ├── controllers/  # Route handlers (auth, events, transactions, otp)
│   │   ├── middleware/   # Token auth, rate limiters, validation
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Business logic & Prisma queries
│   │   ├── sockets/      # Real-time event emitters
│   │   └── utils/        # JWT & general helper scripts
├── user-portal/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/   # Visual cards, modals, left panel panels
│   │   ├── context/      # AuthState & ToastContext providers
│   │   ├── pages/        # Landing, Dashboard, Profile, Auth pages
│   │   ├── api/          # Token caching & API utilities
│   │   └── App.jsx
└── README.md
```

---

## ⚙️ Setup

### Prerequisite Services
Ensure **PostgreSQL** and **Redis** servers are running locally on your system.

### 1. Backend Setup
1. Navigate into the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `backend/.env` file with the following variables:
   ```env
   PORT=8000
   DATABASE_URL="postgresql://username:password@localhost:5432/fundo"
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   REFRESH_TOKEN_SECRET="your_refresh_token_secret"
   SALT=10
   
   # Redis config
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_URL=redis://localhost:6379

   # SMTP Mail Server for OTPs
   GMAIL_USER="your_email@gmail.com"
   GMAIL_PASS="your_app_password"

   # Cloudinary storage
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

   # Razorpay API Keys
   RAZORPAY_KEY_ID="your_razorpay_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

   # Frontend Callback URLs
   FRONTEND_URL=http://localhost:5173
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
   ```
3. Generate the Prisma database client:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../user-portal
   npm install
   ```
2. Create a `user-portal/.env` file:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
