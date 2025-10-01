# Quick Start Guide - 15 Minutes to Deploy

## 🚀 Express Deployment Steps

### Step 1: Database Setup (3 minutes)
1. Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create free account → Create cluster (M0 Free)
3. Add database user: `bhoomi_user` / `strong_password`
4. Network access: Allow all IPs (0.0.0.0/0)
5. Get connection string: `mongodb+srv://bhoomi_user:password@cluster.mongodb.net/spare_parts_db`

### Step 2: Backend on Render (5 minutes)
1. Go to [Render](https://render.com) → Connect GitHub
2. New Web Service → Select your repo
3. Settings:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   ```
   MONGO_URL=your-mongodb-connection-string
   JWT_SECRET=your-32-character-secret
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   UPLOAD_DIR=/tmp/uploads
   ENVIRONMENT=production
   ```
5. Deploy → Copy your backend URL

### Step 3: Frontend on Vercel (5 minutes)
1. Update `frontend/.env.production`:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.onrender.com/api
   ```
2. Go to [Vercel](https://vercel.com) → Import project
3. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.onrender.com/api
   ```
5. Deploy → Your app is live!

### Step 4: Test (2 minutes)
1. Visit your Vercel URL
2. Browse catalog → Add to cart → Place order
3. Login to admin: `/admin` (admin/admin123)
4. Check if everything works

## 🎯 Required Information

Before starting, have these ready:
- [ ] Gmail app password ([Get here](https://support.google.com/accounts/answer/185833))
- [ ] MongoDB Atlas connection string
- [ ] Strong JWT secret (32+ characters)

## ⚡ That's it! 
Your Bhoomi Enterprises app is now live on the internet!

### URLs:
- **Customer Site**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/admin`
- **API**: `https://your-backend.onrender.com`