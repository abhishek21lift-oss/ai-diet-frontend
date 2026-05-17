# 🏋️ 619 Fitness Studio — AI Coaching Platform

Production-ready Full Stack App for AI-powered fitness & nutrition coaching.

## Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Anthropic Claude (diet plan generation)
- **Auth:** JWT + Refresh Tokens
- **Storage:** AWS S3 (progress photos)
- **Deployment:** Docker + Render.com

## Quick Start

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # fill in values
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev            # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env.local
npm run dev            # http://localhost:3000
```

Login: `abhishek@619fitness.com` / `Trainer@619`

## Features

- ✅ Multi-step client onboarding
- ✅ Auto BMI/BMR/TDEE/Macro calculation
- ✅ Claude AI diet plan generation
- ✅ Progress tracking & weight history
- ✅ Weekly check-ins
- ✅ Progress photo upload (S3)
- ✅ Admin dashboard with analytics
- ✅ Role-based access (Admin / Trainer / Client)
- ✅ JWT auth with refresh tokens
- ✅ Rate limiting & security headers

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) — Local, Docker, Render, VPS
- [API Routes](./backend/src/) — REST API documentation

## Project Structure

```
619-fitness-app/
├── backend/          Node.js + Express + Prisma
├── frontend/         React + Tailwind
├── docker-compose.yml
├── render.yaml       Render.com IaC
└── DEPLOYMENT.md     Full deployment guide
```

---
*619 Fitness Studio · Head Trainer: Abhishek · K11 Certified*
