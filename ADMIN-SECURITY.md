# Admin Panel Security & Features

## 🔐 Admin Authentication

Never commit real credentials to the repository.

### How to access Admin
- In development (localhost): login is permitted for convenience. Protect the server with proper env variables.
- In production: all /api/admin routes require the server-side header token `x-admin-token` matching `ADMIN_DASHBOARD_TOKEN`.
- Optionally, seed temporary client-side credentials only on your device using the browser console:
  `localStorage.setItem('sitefy_admin_credentials', JSON.stringify({ 'you@example.com': 'your-strong-password' }))`

### Security Features
- ✅ Session-based authentication with 2-hour timeout
- ✅ Auto-logout on inactivity
- ✅ Protected admin routes (server validates `x-admin-token` in production)
- ✅ Session extension on user activity
- ✅ Admin pages are marked noindex

---

## 📋 Admin Capabilities

### ✅ What Admin CAN Do

#### 1. Review Management
- Approve or Reject Reviews
- Delete Reviews
- View Review Details

#### 2. Content Editing
- Edit Tags
- Edit Project Names
- Add Admin Notes

#### 3. Rating Control
- Hide/Show Star Ratings

#### 4. Filtering & Organization
- Filter by Status
- Sort by Date
- Search & Browse

---

## 🔗 Access Points

1. Direct Admin Login: `/admin-login.html`
2. Footer Link: "Admin Panel" in main site footer
3. Auto-redirect: Unauthenticated users sent to login

---

## 🚀 Implementation Status

✅ Authentication System  
✅ Admin Features  
✅ Server-side Protection for Admin Routes  
✅ Database Schema & API Endpoints  
✅ Frontend UI  

---

## 🔒 Secrets Management
- Add secrets only to `.env` or hosting provider env vars (never in source).
- `.env` is git-ignored.
- Rotate any keys that were previously committed.
- Required env vars (see `.env.example`):
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - ADMIN_DASHBOARD_TOKEN (for production admin routes)
  - ALLOWED_ORIGINS
  - ALLOWED_VIDEO_TYPES
  - MAX_FILE_SIZE
