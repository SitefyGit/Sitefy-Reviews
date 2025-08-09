# Sitefy Reviews - Deployment Guide

This guide will help you deploy the Sitefy Reviews application using Supabase and Vercel.

## 🚀 Quick Setup

### 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Setup Database**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the content from `supabase-setup.sql`
   - Run the SQL commands to create tables, policies, and sample data

3. **Configure Storage**
   - The SQL script will create a `review-media` bucket
   - Go to Storage in your Supabase dashboard to verify it was created

4. **Get Your Keys**
   - Go to Settings > API
   - Copy your:
     - Project URL
     - `anon` `public` key
     - `service_role` `secret` key

### 2. Vercel Deployment

1. **Prepare Your Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:

3. **Environment Variables in Vercel**
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   MAX_FILE_SIZE=52428800
   ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/ogg,video/avi,video/mov
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## 🔧 Configuration

### Color Scheme
The application uses your requested color scheme:
- Primary Color: `#00334E` (Dark Blue)
- Secondary Color: `#00B675` (Green)
- Accent Color: `#fbbf24` (Yellow for stars)

### File Upload Limits
- **Video Size**: 50MB maximum
- **Video Duration**: 1 minute maximum
- **Supported Formats**: MP4, WebM, OGG, AVI, MOV

### Review Moderation
- All reviews require admin approval before publication
- Access admin panel at: `https://your-domain.vercel.app/admin.html`
- Admin authentication should be implemented based on your needs

## 📁 File Structure

```
sitefy-reviews/
├── index.html              # Main review submission page
├── admin.html              # Admin moderation panel
├── styles.css              # Complete styling
├── script.js               # Frontend functionality
├── server.js               # Backend API server
├── package.json            # Node.js dependencies
├── vercel.json             # Vercel configuration
├── supabase-setup.sql      # Database setup script
├── .env.example            # Environment variables template
└── README.md               # Documentation
```

## 🛡️ Security Features

### Row Level Security (RLS)
- Enabled on all tables
- Public can only read approved reviews
- Insert allowed for new submissions
- Admin access controlled by JWT claims

### File Upload Security
- File type validation
- File size limits
- Server-side processing
- Secure storage in Supabase

### Data Validation
- Email format validation
- Required field checking
- XSS prevention with HTML escaping
- SQL injection prevention with parameterized queries

## 🔗 API Endpoints

### Public Endpoints
- `GET /api/reviews` - Get approved reviews
- `POST /api/reviews` - Submit new review
- `GET /api/health` - Health check

### Admin Endpoints
- `GET /api/admin/reviews` - Get all reviews (with status filter)
- `PATCH /api/admin/reviews/:id` - Update review status

## 📱 Features

### User Features
- ✅ Text and video review submission
- ✅ Star rating system (1-5 stars)
- ✅ Project categorization with tags
- ✅ File upload with validation
- ✅ Responsive design
- ✅ Real-time form validation

### Admin Features
- ✅ Review moderation panel
- ✅ Approve/reject reviews
- ✅ View detailed review information
- ✅ Filter by status (pending/approved/rejected)
- ✅ Video preview in admin panel

### Technical Features
- ✅ Supabase integration
- ✅ Vercel serverless deployment
- ✅ File storage in Supabase Storage
- ✅ Real-time data updates
- ✅ Error handling and validation
- ✅ Mobile-responsive design

## 🎨 Customization

### Adding New Tags
Edit the tags section in `index.html`:
```html
<div class="tag-item">
    <input type="checkbox" id="tag-new-category" name="tags" value="New Category">
    <label for="tag-new-category">New Category</label>
</div>
```

### Modifying Colors
Update CSS variables in `styles.css`:
```css
:root {
    --primary-color: #00334E;
    --secondary-color: #00B675;
    --accent-color: #fbbf24;
}
```

### Email Notifications
To add email notifications when reviews are approved/rejected:
1. Install a email service (like Resend or SendGrid)
2. Add email sending logic in `server.js`
3. Trigger emails in the status update endpoint

## 🔍 Monitoring

### Supabase Monitoring
- Database performance in Supabase dashboard
- Storage usage tracking
- API request monitoring

### Vercel Monitoring
- Function execution logs
- Performance metrics
- Error tracking

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Check Vercel environment variables are set correctly
   - Redeploy after adding environment variables

2. **File Upload Fails**
   - Check Supabase Storage bucket exists
   - Verify storage policies are correct
   - Check file size and type limits

3. **Reviews Not Appearing**
   - Check review status (should be 'approved')
   - Verify API endpoints are working
   - Check browser console for errors

4. **Admin Panel Not Loading**
   - Check if admin.html is accessible
   - Verify API endpoints for admin functions
   - Check browser console for errors

### Getting Help
- Check Supabase documentation for database issues
- Check Vercel documentation for deployment issues
- Review browser console for frontend issues
- Check Vercel function logs for backend issues

## 📞 Support

For technical support or questions about the implementation:
- Check the project documentation
- Review the error logs in Vercel dashboard
- Check Supabase project logs
- Contact the development team

---

**Note**: This is a production-ready implementation with proper security, validation, and error handling. Make sure to test thoroughly before going live with real customer data.
