# 🚀 619 Fitness Studio — Complete Deployment Guide

---

## OVERVIEW

This guide covers 4 deployment options:
1. **Local Development** (fastest to start)
2. **Docker (local)** (production-like)
3. **Render.com** (recommended cloud — free tier)
4. **Manual VPS** (full control)

---

## PREREQUISITES

Install these before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v20+ | https://nodejs.org |
| npm | v10+ | comes with Node |
| Docker | v24+ | https://docker.com |
| Git | any | https://git-scm.com |
| PostgreSQL | v16 | https://postgresql.org (for local dev) |

---

## OPTION 1 — LOCAL DEVELOPMENT

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/your-org/619-fitness-app.git
cd 619-fitness-app
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fitness_619"
JWT_SECRET=your_secret_min_32_chars_here_619fitness
JWT_REFRESH_SECRET=refresh_secret_min_32_chars_619
ANTHROPIC_API_KEY=sk-ant-api03-...
AWS_ACCESS_KEY_ID=AKIA...            # Optional: for photo uploads
AWS_SECRET_ACCESS_KEY=...            # Optional
```

### Step 3: Create PostgreSQL Database

```bash
# Create database (if psql is installed)
createdb fitness_619

# Or connect to psql and run:
psql -U postgres -c "CREATE DATABASE fitness_619;"
```

### Step 4: Run Migrations & Seed

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed with demo data
npx ts-node prisma/seed.ts
```

### Step 5: Start Backend

```bash
npm run dev
# ✅ API running at http://localhost:5000
# ✅ Health check: http://localhost:5000/health
```

### Step 6: Frontend Setup

```bash
# Open a new terminal
cd ../frontend

# Install dependencies
npm install

# Create env file
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start dev server
npm run dev
# ✅ Frontend at http://localhost:3000
```

### Step 7: Login

Open `http://localhost:3000` and log in with:
- **Email:** `abhishek@619fitness.com`
- **Password:** `Trainer@619`

---

## OPTION 2 — DOCKER (LOCAL)

### Step 1: Create root .env

```bash
# In the project root (619-fitness-app/)
cp .env.example .env
```

Fill in `.env`:
```env
JWT_SECRET=619fitness_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=619fitness_refresh_secret_32ch
ANTHROPIC_API_KEY=sk-ant-api03-...
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=619-fitness-uploads
```

### Step 2: Build and Run

```bash
# In project root
docker-compose up --build

# Or run in background:
docker-compose up --build -d
```

### Step 3: Seed Database

```bash
# After containers start (wait ~20 seconds for db)
docker-compose exec api npx ts-node prisma/seed.ts
```

### Step 4: Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f db

# Stop all
docker-compose down

# Stop and delete data
docker-compose down -v

# Restart only API
docker-compose restart api

# Run Prisma Studio (DB browser)
docker-compose exec api npx prisma studio
```

---

## OPTION 3 — RENDER.COM (RECOMMENDED CLOUD)

Render.com gives you **free PostgreSQL + free web service**. Perfect for starting.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: 619 Fitness Studio"
git remote add origin https://github.com/your-username/619-fitness-app.git
git push -u origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

### Step 3: Create PostgreSQL Database

1. Click **New → PostgreSQL**
2. Name: `fitness-619-db`
3. Region: Singapore
4. Plan: **Free**
5. Click **Create Database**
6. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 4: Deploy Backend API

1. Click **New → Web Service**
2. Connect your GitHub repo
3. **Root Directory:** `backend`
4. **Build Command:** `npm install && npx prisma generate && npm run build`
5. **Start Command:** `npx prisma migrate deploy && node dist/server.js`
6. **Plan:** Free

#### Set Environment Variables (in Render dashboard):
```
NODE_ENV          = production
DATABASE_URL      = [paste Internal DB URL from Step 3]
JWT_SECRET        = [generate: openssl rand -base64 32]
JWT_REFRESH_SECRET= [generate: openssl rand -base64 32]
ANTHROPIC_API_KEY = sk-ant-api03-...
ALLOWED_ORIGINS   = https://fitness-619-frontend.onrender.com
```

7. Click **Create Web Service**
8. Note your API URL: `https://fitness-619-api.onrender.com`

### Step 5: Seed the Database

After the backend deploys successfully:
```bash
# Run seed via Render Shell or SSH
# In Render dashboard → your API service → Shell
npx ts-node prisma/seed.ts
```

### Step 6: Deploy Frontend

1. Click **New → Static Site**
2. Connect same GitHub repo
3. **Root Directory:** `frontend`
4. **Build Command:** `npm install && npm run build`
5. **Publish Directory:** `dist`

#### Set Environment Variables:
```
VITE_API_URL = https://fitness-619-api.onrender.com
```

6. Click **Create Static Site**
7. Your app is live at: `https://fitness-619-frontend.onrender.com`

### Step 7: Configure CORS

Go back to your **API service → Environment** and update:
```
ALLOWED_ORIGINS = https://fitness-619-frontend.onrender.com
```

Redeploy the API service.

---

## OPTION 4 — VPS (Ubuntu/Digital Ocean/AWS EC2)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Setup PostgreSQL

```bash
sudo -u postgres psql
CREATE DATABASE fitness_619;
CREATE USER fitness_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE fitness_619 TO fitness_user;
\q
```

### Step 3: Deploy Backend

```bash
# Clone repo
git clone https://github.com/your-org/619-fitness-app.git /var/www/fitness-app
cd /var/www/fitness-app/backend

# Install deps
npm install

# Create production .env
nano .env
# Fill in all values

# Build
npm run build
npx prisma migrate deploy
npx prisma generate
npx ts-node prisma/seed.ts

# Start with PM2
pm2 start dist/server.js --name fitness-api
pm2 startup
pm2 save
```

### Step 4: Deploy Frontend

```bash
cd /var/www/fitness-app/frontend
npm install
VITE_API_URL=https://api.yourdomain.com npm run build
```

### Step 5: Configure Nginx

```nginx
# /etc/nginx/sites-available/fitness

# API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/fitness-app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fitness /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (free)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## AWS S3 SETUP (for Progress Photos)

### Step 1: Create S3 Bucket

1. Go to AWS Console → S3 → **Create Bucket**
2. Name: `619-fitness-uploads`
3. Region: `ap-south-1` (Mumbai)
4. Uncheck "Block all public access" → confirm
5. Click **Create bucket**

### Step 2: Set Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::619-fitness-uploads/public/*"
    }
  ]
}
```

### Step 3: Create IAM User

1. AWS Console → IAM → Users → **Add User**
2. Name: `619-fitness-api`
3. Permissions: Attach `AmazonS3FullAccess` (or create scoped policy)
4. Create Access Key → copy `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`
5. Add to your `.env`

---

## ANTHROPIC API KEY SETUP

1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (`sk-ant-api03-...`)
5. Add to your `.env` as `ANTHROPIC_API_KEY`

**Note:** Free tier has limited credits. For production, set up billing.

---

## POST-DEPLOYMENT CHECKLIST

- [ ] Backend health check responds: `GET /health`
- [ ] Login works with seeded credentials
- [ ] Can create a client
- [ ] Health metrics calculate correctly (BMI/BMR/TDEE)
- [ ] AI diet plan generates (requires valid Anthropic API key)
- [ ] Progress logging works
- [ ] CORS is configured correctly
- [ ] Environment variables are set (no defaults in production)
- [ ] JWT secret is strong (32+ characters)
- [ ] Database connection is stable

---

## DEFAULT LOGIN CREDENTIALS

After running the seed:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@619fitness.com | Admin@619 |
| Trainer | abhishek@619fitness.com | Trainer@619 |

⚠️ **Change passwords immediately in production!**

---

## TROUBLESHOOTING

### "Cannot connect to database"
```bash
# Check DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME

# Test connection:
npx prisma db pull
```

### "Prisma client not generated"
```bash
npx prisma generate
```

### "AI generation fails"
- Check `ANTHROPIC_API_KEY` is set and valid
- Check you have API credits at console.anthropic.com
- The rate limit is 20 AI generations per hour per server

### "CORS error in browser"
- Ensure `ALLOWED_ORIGINS` includes your frontend URL exactly
- No trailing slash in origin URL

### "JWT invalid"
- Ensure `JWT_SECRET` is the same on all restarts
- Don't use the default value in production

### Free tier cold starts (Render.com)
- Free tier services sleep after 15 min inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter ($7/mo) to avoid this

---

*619 Fitness Studio — Built by Abhishek | K11 Certified Personal Trainer*
