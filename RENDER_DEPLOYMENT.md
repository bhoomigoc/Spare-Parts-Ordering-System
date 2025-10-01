# Bhoomi Enterprises - Render Deployment Guide

## ✅ Deployment Fixes Applied

This deployment has been optimized to work with **Python 3.13** and Render's infrastructure:

### Key Updates Made:
1. **Pillow compatibility**: Updated to `>=11.0.0` for Python 3.13 support
2. **Pydantic compatibility**: Updated to `>=2.8.0` to fix `ForwardRef._evaluate()` issues
3. **FastAPI**: Updated to `0.115.0` for better stability
4. **Environment variables**: Proper error handling for missing `MONGO_URL`

## 📋 Environment Variables Required

Set these in your Render dashboard:

### Required Variables:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=auto_generated_by_render
```

### Optional Variables (for email functionality):
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_NAME=Bhoomi Enterprises
SMTP_FROM_EMAIL=your_email@gmail.com
```

### System Variables (auto-configured):
```
UPLOAD_DIR=/tmp/uploads
ENVIRONMENT=production
```

## 🚀 Deployment Steps

1. **Connect Repository**: Link your GitHub/GitLab repository to Render
2. **Select Service**: Choose "Web Service"  
3. **Configure Build**: 
   - Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Set Environment Variables**: Add the variables listed above
5. **Deploy**: Click "Create Web Service"

## 🔧 Troubleshooting

### Common Issues:
- **Build fails on pydantic-core**: Ensure using `pydantic>=2.8.0`
- **Build fails on Pillow**: Ensure using `Pillow>=11.0.0`  
- **Service won't start**: Check `MONGO_URL` is set correctly
- **Images not loading**: Verify `UPLOAD_DIR=/tmp/uploads` is set

### Health Check:
Your service should respond at: `https://your-service.onrender.com/`

### API Test:
Test your API: `https://your-service.onrender.com/api/machines`

## 📝 Notes

- Python 3.13 is automatically used by Render
- Uploads are stored in ephemeral storage (`/tmp/uploads`)
- Email functionality requires valid SMTP credentials
- JWT secrets are auto-generated for security

## 🎯 Verification

After deployment, verify:
1. Health check endpoint returns 200 OK
2. `/api/machines` returns machine data
3. Admin panel accessible at `/admin`
4. Image uploads work correctly