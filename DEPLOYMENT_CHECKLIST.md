# Pre-Deployment Checklist

## ✅ Files to Upload to GitHub

### Backend Files:
- [ ] `/backend/server.py` - Main FastAPI application
- [ ] `/backend/requirements.txt` - Python dependencies  
- [ ] `/backend/runtime.txt` - Python version (3.11.0)
- [ ] `/backend/Procfile` - Render start command
- [ ] `/backend/render.yaml` - Render configuration (optional)
- [ ] `/backend/.env.example` - Environment variables template

### Frontend Files:
- [ ] `/frontend/src/App.js` - Main React application
- [ ] `/frontend/public/bhoomi-logo.png` - Company logo
- [ ] `/frontend/package.json` - Node.js dependencies
- [ ] `/frontend/vercel.json` - Vercel configuration
- [ ] `/frontend/.env.production` - Production environment variables
- [ ] `/frontend/.env.local` - Development environment variables

## 📋 MongoDB Atlas Setup

- [ ] Account created at mongodb.com/atlas
- [ ] Free cluster (M0) created
- [ ] Database user created: `bhoomi_user` with strong password
- [ ] Network access: Allow all IPs (0.0.0.0/0)
- [ ] Connection string copied and formatted:
  ```
  mongodb+srv://bhoomi_user:password@cluster.mongodb.net/spare_parts_db
  ```

## 🔐 Gmail App Password

- [ ] 2-Step Verification enabled on Gmail
- [ ] App password generated for "Bhoomi Enterprises"
- [ ] 16-character password saved securely

## 🚀 Render Backend Deployment

- [ ] Render account created and GitHub connected
- [ ] Web service created with settings:
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`  
  - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables set:
  - `MONGO_URL` (from MongoDB Atlas)
  - `JWT_SECRET` (32+ character secret)
  - `SMTP_SERVER=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USERNAME` (your Gmail)
  - `SMTP_PASSWORD` (Gmail app password)
  - `UPLOAD_DIR=/tmp/uploads`
  - `ENVIRONMENT=production`

## ⚡ Vercel Frontend Deployment

- [ ] Vercel account created and GitHub connected
- [ ] Project imported with settings:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `build`
- [ ] Environment variable set:
  - `REACT_APP_BACKEND_URL` (your Render backend URL + /api)

## 🧪 Testing

- [ ] Backend health check: `https://your-backend.onrender.com` returns success
- [ ] Frontend loads: `https://your-app.vercel.app` shows homepage
- [ ] Customer flow: Browse → Add to cart → Checkout works
- [ ] Admin login: `/admin` with admin/admin123 works
- [ ] Sample data: Visit backend `/admin/init-sample-data` endpoint

## 🎯 Final Steps

- [ ] Update README.md with your live URLs
- [ ] Share URLs with stakeholders:
  - Customer Site: `https://your-app.vercel.app`
  - Admin Panel: `https://your-app.vercel.app/admin` 
  - API: `https://your-backend.onrender.com`

## 🆘 If Something Goes Wrong

1. **Check Render Logs**: Dashboard → Your Service → Logs
2. **Check Vercel Logs**: Dashboard → Your Project → Functions  
3. **Test API Endpoints**: Use browser or Postman
4. **Verify Environment Variables**: Double-check all settings
5. **MongoDB Connection**: Test in MongoDB Atlas → Connect → Compass

## 📧 Credentials Summary

Save these for future reference:

```
MongoDB Atlas:
- Username: bhoomi_user
- Password: [your-db-password]
- Connection: [your-connection-string]

Gmail:
- Email: office.bhoomigroup@gmail.com
- App Password: [your-16-char-password]

Admin Login:
- Username: admin
- Password: admin123

JWT Secret: [your-32-char-secret]
```

---
**Ready to deploy? Follow the QUICK_START.md for 15-minute deployment!**