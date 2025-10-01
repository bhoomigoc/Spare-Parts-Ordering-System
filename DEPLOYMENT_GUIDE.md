# Bhoomi Enterprises - Complete Deployment Guide
**Backend on Render + Frontend on Vercel**

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
6. [Testing Deployment](#testing-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need:
1. **GitHub Account** (for code repository)
2. **Render Account** (for backend hosting)
3. **Vercel Account** (for frontend hosting)
4. **MongoDB Atlas Account** (for database)
5. **Gmail App Password** (for email notifications)

### Repository Structure:
Your GitHub repository should have this structure:
```
your-repo/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── Procfile
│   └── render.yaml
└── frontend/
    ├── src/
    │   └── App.js
    ├── public/
    │   └── bhoomi-logo.png
    ├── package.json
    ├── vercel.json
    └── .env.production
```

---

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
1. **Upload all files** to GitHub repository
2. **Ensure backend folder** contains:
   - ✅ `server.py` (main application)
   - ✅ `requirements.txt` (dependencies)
   - ✅ `runtime.txt` (Python version)
   - ✅ `Procfile` (start command)

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Connect your repository

### Step 3: Deploy Backend
1. **Click "New +"** → **"Web Service"**
2. **Select your repository**
3. **Configure settings**:
   - **Name**: `bhoomi-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 4: Set Environment Variables
In Render dashboard, go to **Environment** tab and add:

```bash
# Database (REQUIRED - Get from MongoDB Atlas)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/spare_parts_db

# Security (REQUIRED - Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters

# Email Configuration (REQUIRED for order notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-business-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# File Upload (REQUIRED)
UPLOAD_DIR=/tmp/uploads

# Environment (REQUIRED)
ENVIRONMENT=production

# Optional Database Name (if different)
DB_NAME=spare_parts_db
```

### Step 5: Deploy
1. **Click "Create Web Service"**
2. **Wait for deployment** (takes 3-5 minutes)
3. **Note your backend URL**: `https://your-app-name.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
1. **Edit `/frontend/.env.production`**:
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com/api
REACT_APP_ENV=production
```
**Replace `your-backend-url` with your actual Render URL!**

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Connect your repository

### Step 3: Deploy Frontend
1. **Click "Add New..."** → **"Project"**
2. **Import your repository**
3. **Configure settings**:
   - **Project Name**: `bhoomi-enterprises`
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 4: Set Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com/api
REACT_APP_ENV=production
```

### Step 5: Deploy
1. **Click "Deploy"**
2. **Wait for deployment** (takes 2-3 minutes)
3. **Note your frontend URL**: `https://your-app.vercel.app`

---

## Environment Configuration

### Backend Environment Variables (Render)
```bash
# REQUIRED - Database Connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/spare_parts_db

# REQUIRED - Security
JWT_SECRET=generate-a-secure-32-character-secret-key

# REQUIRED - Email (for order notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=office.bhoomigroup@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# REQUIRED - File Upload
UPLOAD_DIR=/tmp/uploads

# REQUIRED - Environment
ENVIRONMENT=production
```

### Frontend Environment Variables (Vercel)
```bash
# REQUIRED - Backend API URL
REACT_APP_BACKEND_URL=https://your-backend.onrender.com/api

# OPTIONAL - Environment
REACT_APP_ENV=production
```

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Sign up** for free account
3. **Create organization** and **project**

### Step 2: Create Cluster
1. **Click "Build a Database"**
2. **Choose "FREE" (M0 Sandbox)**
3. **Select cloud provider** (AWS recommended)
4. **Choose region** (closest to your Render region)
5. **Cluster name**: `bhoomi-cluster`
6. **Click "Create Cluster"**

### Step 3: Create Database User
1. **Go to "Database Access"**
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `bhoomi_user`
5. **Password**: Generate strong password (save this!)
6. **Database User Privileges**: Read and write to any database
7. **Click "Add User"**

### Step 4: Configure Network Access
1. **Go to "Network Access"**
2. **Click "Add IP Address"**
3. **Choose "Allow Access from Anywhere"** (0.0.0.0/0)
4. **Click "Confirm"**

### Step 5: Get Connection String
1. **Go to "Clusters"**
2. **Click "Connect" on your cluster**
3. **Choose "Connect your application"**
4. **Driver**: Python, Version 3.12 or later
5. **Copy connection string**:
```
mongodb+srv://bhoomi_user:<password>@bhoomi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
6. **Replace `<password>` with your actual password**
7. **Add database name at the end**:
```
mongodb+srv://bhoomi_user:your-password@bhoomi-cluster.xxxxx.mongodb.net/spare_parts_db?retryWrites=true&w=majority
```

---

## Testing Deployment

### Step 1: Test Backend
1. **Open your backend URL**: `https://your-backend.onrender.com`
2. **Should show**: `{"status":"healthy","message":"Bhoomi Enterprises API is running"}`
3. **Test sample data**: `https://your-backend.onrender.com/admin/init-sample-data`
4. **Test machines**: `https://your-backend.onrender.com/machines`

### Step 2: Test Frontend
1. **Open your frontend URL**: `https://your-app.vercel.app`
2. **Check if**:
   - ✅ Page loads without errors
   - ✅ Machines display correctly
   - ✅ Navigation works (Home → Machine → Parts)
   - ✅ Cart functionality works
   - ✅ Admin login works (admin/admin123)

### Step 3: Test Complete Flow
1. **Customer Flow**:
   - Browse machines → Select parts → Add to cart → Checkout → Fill form → Submit order
2. **Admin Flow**:
   - Login → View orders → Manage catalog → Add/edit/delete items

### Step 4: Test Email (Optional)
- If SMTP is configured correctly, submitting an order should send email to office.bhoomigroup@gmail.com

---

## Troubleshooting

### Common Backend Issues

#### 1. **"Application failed to respond"**
**Solution**:
- Check Render logs in dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

#### 2. **"KeyError: 'MONGO_URL'"**
**Solution**:
- Add `MONGO_URL` environment variable in Render
- Check MongoDB Atlas connection string format

#### 3. **"Database connection failed"**
**Solution**:
- Verify MongoDB Atlas network access allows all IPs
- Check database user credentials
- Ensure database name is correct in connection string

#### 4. **"Module not found"**
**Solution**:
- Check `requirements.txt` has all dependencies
- Clear build cache in Render and redeploy

### Common Frontend Issues

#### 1. **"Cannot read properties of undefined"**
**Solution**:
- Check `REACT_APP_BACKEND_URL` environment variable
- Ensure backend URL ends with `/api`
- Verify backend is running and accessible

#### 2. **"Network Error" or "CORS Error"**
**Solution**:
- Verify backend URL is correct
- Check backend CORS settings
- Ensure backend is deployed and running

#### 3. **"404 Not Found" on refresh**
**Solution**:
- `vercel.json` should handle routing correctly
- Check build output directory is `build`

#### 4. **Environment variables not working**
**Solution**:
- Environment variables must start with `REACT_APP_`
- Redeploy after changing environment variables

### MongoDB Atlas Issues

#### 1. **"Authentication failed"**
**Solution**:
- Check database user password
- Verify user has correct permissions
- URL-encode special characters in password

#### 2. **"Connection timeout"**
**Solution**:
- Check network access settings
- Allow all IPs (0.0.0.0/0) for Render deployment
- Verify cluster is running

---

## Gmail App Password Setup

### For Email Notifications:
1. **Go to Google Account Settings**
2. **Security → 2-Step Verification** (must be enabled)
3. **App passwords → Generate new**
4. **Choose "Mail" and "Other"**
5. **Name**: "Bhoomi Enterprises"
6. **Copy the 16-character password**
7. **Use this as `SMTP_PASSWORD`**

---

## Deployment Checklist

### Before Deployment:
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user and network access configured
- [ ] Gmail app password generated

### Backend (Render):
- [ ] Web service created
- [ ] Environment variables set (especially MONGO_URL)
- [ ] Build successful
- [ ] Health check endpoint returns success

### Frontend (Vercel):
- [ ] Project created and linked to GitHub
- [ ] REACT_APP_BACKEND_URL updated with Render URL
- [ ] Build successful
- [ ] Site loads without errors

### Final Testing:
- [ ] Customer can browse and order
- [ ] Admin can login and manage
- [ ] PDF generation works
- [ ] Email notifications work (if configured)

---

## Support

### Need Help?
1. **Check Render logs**: Dashboard → Your Service → Logs
2. **Check Vercel logs**: Dashboard → Your Project → Functions
3. **MongoDB Atlas**: Cluster → Monitoring

### Common URLs:
- **Backend Health**: `https://your-backend.onrender.com`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Frontend**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/admin`

**Remember**: Replace all placeholder URLs with your actual deployment URLs!

---

## Cost Breakdown

### Free Tier Limits:
- **Render**: 750 hours/month (enough for 1 service)
- **Vercel**: Unlimited hobby projects
- **MongoDB Atlas**: 512MB storage (M0 cluster)
- **Total Monthly Cost**: $0 for small usage

### Scaling:
- **Render Pro**: $7/month (for always-on service)
- **Vercel Pro**: $20/month (for teams)
- **MongoDB Atlas**: $9/month (M10 cluster)

This deployment setup provides a production-ready, scalable solution for the Bhoomi Enterprises Spare Parts Ordering System!