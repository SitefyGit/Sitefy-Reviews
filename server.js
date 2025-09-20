const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Admin API token middleware (enforced in production)
const isProd = (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production');
function requireAdminToken(req, res, next) {
  if (!isProd) return next();
  const token = req.header('x-admin-token');
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    return res.status(500).json({ success: false, message: 'Server misconfigured: ADMIN_DASHBOARD_TOKEN missing' });
  }
  if (!token || token !== expected) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
}

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_VIDEO_TYPES?.split(',') || [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/quicktime',
      'video/x-matroska',
      'video/3gpp',
      'video/3gpp2'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only video files are allowed.`), false);
    }
  }
});

// Routes

// Submit Review
app.post('/api/reviews', upload.single('videoUpload'), async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userTitle,
      projectName,
      projectDescription,
      tags,
      rating,
      reviewType,
      reviewText
    } = req.body;

    // Validate required fields
    if (!userName || !userEmail || !projectName || !rating || !tags) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate review content based on type
    if (reviewType === 'text' && (!reviewText || reviewText.trim().length < 10)) {
      return res.status(400).json({
        success: false,
        message: 'Review text must be at least 10 characters long'
      });
    }

    if (reviewType === 'video' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required for video reviews'
      });
    }

    // NEW: both type requires text and video
    if (reviewType === 'both') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Video file is required when submitting text + video review' });
      }
      if (!reviewText || reviewText.trim().length < 10) {
        return res.status(400).json({ success: false, message: 'Review text (min 10 chars) is required when submitting text + video review' });
      }
    }

    // Parse tags if it's a string
    let parsedTags = Array.isArray(tags) ? tags : [tags];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    let videoUrl = null;
    
    // Handle video upload to Supabase Storage (for video or both)
    if (req.file && (reviewType === 'video' || reviewType === 'both')) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `review-videos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-media')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ success: false, message: 'Failed to upload video' });
      }

      const { data: urlData } = supabase.storage.from('review-media').getPublicUrl(filePath);
      videoUrl = urlData.publicUrl;
    }

    // Insert review into database
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_name: userName,
          user_email: userEmail,
          user_title: userTitle || null,
          project_name: projectName,
          project_description: projectDescription || null,
          tags: parsedTags,
          rating: parseInt(rating),
          review_type: reviewType,
          review_text: reviewText || null,
          video_url: videoUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save review' });
    }

    res.json({ success: true, message: 'Review submitted successfully! It will be published after moderation.', data: { ...data[0], debug_videoUrl: videoUrl } });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get approved reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Protect all admin routes
app.use('/api/admin', requireAdminToken);

// Admin endpoint to get all reviews (for moderation)
app.get('/api/admin/reviews', async (req, res) => {
  try {
    // In a real app, you'd add authentication middleware here
    const { status } = req.query;
    
    let query = supabase.from('reviews').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin endpoint to update review status
app.patch('/api/admin/reviews/:id', async (req, res) => {
  try {
    // In a real app, you'd add authentication middleware here
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        status,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin endpoint to edit review (tags and project name)
app.patch('/api/admin/reviews/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, tags, created_at } = req.body;

    const updatePayload = {
      project_name: project_name,
      tags: tags,
      updated_at: new Date().toISOString()
    };

    // Optional: allow admins to edit created_at (date the review appears to be submitted)
    if (created_at) {
      const parsed = new Date(created_at);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid created_at value' });
      }
      // Store as ISO (UTC)
      updatePayload.created_at = parsed.toISOString();
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin endpoint to toggle rating visibility
app.patch('/api/admin/reviews/:id/toggle-rating', async (req, res) => {
  try {
    const { id } = req.params;
    const { hide_rating } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .update({
        hide_rating: hide_rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review'
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin endpoint to delete review
app.delete('/api/admin/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review'
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB.'
      });
    }
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.VERCEL_ENV || 'development'}`);
});
