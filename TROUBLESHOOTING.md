# Sitefy Reviews - Backend Troubleshooting Guide

## 🚨 **Issue: Admin Panel Not Loading Reviews**

You're seeing "Loading reviews..." because the frontend can't connect to the backend API.

---

## 🔧 **Quick Fixes to Try:**

### **1. Check if Backend Server is Running**
```bash
# In your project directory, run:
npm start
# or
node server.js
```

### **2. Test the Connection**
Open this file in your browser:
```
backend-test.html
```
This will run diagnostic tests and tell you exactly what's wrong.

### **3. Check Environment Variables**
Make sure you have a `.env` file with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
PORT=3000
```

### **4. Install Dependencies**
```bash
npm install
```

---

## 🎯 **Most Likely Solutions:**

### **If Running Locally:**
1. ✅ **Start the backend server**: `npm start`
2. ✅ **Check the console**: Look for "Server running on port 3000"
3. ✅ **Test API**: Visit `http://localhost:3000/api/health`

### **If Deployed on Vercel:**
1. ✅ **Check Vercel logs**: Look for deployment errors
2. ✅ **Verify environment variables**: In Vercel dashboard
3. ✅ **Check function execution**: Serverless functions might be timing out

---

## 🐛 **Common Issues:**

| Problem | Solution |
|---------|----------|
| "Loading reviews..." forever | Backend server not running |
| CORS errors | Check ALLOWED_ORIGINS in .env |
| Database errors | Verify Supabase credentials |
| 404 errors | API routes not configured |

---

## 📞 **Next Steps:**

1. **Run the backend test**: Open `backend-test.html`
2. **Check browser console**: Press F12 → Console tab
3. **Share the errors**: Tell me what the diagnostic tool shows

The filter tabs (Pending, Approved, Rejected) will work once the backend connection is established! 🎉
