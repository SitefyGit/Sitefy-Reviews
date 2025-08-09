# Sitefy Reviews Page

A comprehensive review submission page for Sitefy.co that allows users to submit both text and video reviews with detailed project information and tagging system.

## Features

### User Features
- **Dual Review Types**: Users can submit either text reviews or video reviews (max 1 minute)
- **Project Details**: Add project name, description, and relevant tags
- **Star Rating System**: 5-star rating system for service evaluation
- **Tag System**: Categorize reviews with predefined tags including:
  - Online Business
  - Sitefy To Do
  - Sitefy Resume
  - SaaS Project
  - IT Project
  - Marketing Services
  - Website Development
  - Dropshipping Store
  - Affiliate Website
  - Marketplace Website

### Admin Features (Ready for Implementation)
- **Review Moderation**: All reviews require approval before publication
- **Content Management**: Admin can modify/edit approved reviews
- **Tag Management**: Admin can hide/show or modify tags
- **Rating Visibility**: Admin can control star rating visibility

### Technical Features
- **Responsive Design**: Mobile-first approach with full tablet and desktop support
- **Video Upload**: Secure video upload with file size and duration validation
- **Form Validation**: Real-time validation with user-friendly error messages
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Accessibility**: ARIA labels and keyboard navigation support

## File Structure

```
sitefy-reviews/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Interactive functionality and validation
└── README.md          # Project documentation
```

## Installation

1. Clone or download the project files
2. Ensure all files are in the same directory
3. Open `index.html` in a web browser
4. For production, upload to your web server

## Configuration

### Backend Integration
To make the form functional, you'll need to:

1. **Replace the form submission handler** in `script.js` (line ~150) with your actual API endpoint
2. **Implement file upload handling** for video reviews
3. **Add database storage** for review data
4. **Create admin panel** for review moderation

### Example Backend Integration (PHP)

```php
<?php
// reviews-handler.php
if ($_POST) {
    $reviewData = [
        'user_name' => $_POST['userName'],
        'user_email' => $_POST['userEmail'],
        'user_title' => $_POST['userTitle'],
        'project_name' => $_POST['projectName'],
        'project_description' => $_POST['projectDescription'],
        'tags' => $_POST['tags'],
        'rating' => $_POST['rating'],
        'review_type' => $_POST['reviewType'],
        'review_text' => $_POST['reviewText'],
        'status' => 'pending', // For admin approval
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    // Handle video upload if present
    if ($_FILES['videoUpload']['size'] > 0) {
        // Process video upload
        $uploadDir = 'uploads/videos/';
        $videoFile = $uploadDir . uniqid() . '_' . $_FILES['videoUpload']['name'];
        move_uploaded_file($_FILES['videoUpload']['tmp_name'], $videoFile);
        $reviewData['video_file'] = $videoFile;
    }
    
    // Save to database
    // $database->insert('reviews', $reviewData);
    
    echo json_encode(['success' => true, 'message' => 'Review submitted successfully']);
}
?>
```

## Customization

### Adding New Tags
To add new tags, modify the tags section in `index.html`:

```html
<div class="tag-item">
    <input type="checkbox" id="tag-new-category" name="tags" value="New Category">
    <label for="tag-new-category">New Category</label>
</div>
```

### Styling Customization
Key CSS variables for easy customization:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #fbbf24;
    --text-color: #333;
    --background-color: #f8f9fa;
}
```

### Video Upload Limits
Modify video constraints in `script.js`:

```javascript
// Change file size limit (currently 50MB)
if (file.size > 50 * 1024 * 1024) {

// Change duration limit (currently 60 seconds)
if (this.duration > 60) {
```

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+

## Performance

- **Optimized Images**: Uses efficient image formats and sizes
- **Lazy Loading**: Reviews load progressively for better performance
- **Minimal Dependencies**: Only Font Awesome for icons
- **Compressed Assets**: CSS and JS are optimized for production

## Security Considerations

- **File Upload Validation**: Video files are validated on both client and server side
- **XSS Prevention**: All user inputs should be sanitized on the backend
- **CSRF Protection**: Implement CSRF tokens for form submissions
- **Rate Limiting**: Add rate limiting to prevent spam submissions

## SEO Features

- **Semantic HTML**: Proper heading structure and semantic elements
- **Meta Tags**: Ready for SEO meta tag additions
- **Schema Markup**: Review schema can be added for rich snippets
- **Open Graph**: Social media sharing optimization ready

## Future Enhancements

1. **Advanced Filtering**: Filter reviews by rating, tags, or date
2. **Review Voting**: Allow users to vote helpful/not helpful
3. **Reply System**: Allow admin responses to reviews
4. **Analytics Dashboard**: Track review metrics and user engagement
5. **Email Notifications**: Notify users when their review is approved
6. **Multi-language Support**: Internationalization capabilities

## Support

For technical support or questions about implementation, please contact the development team or refer to the project documentation.

## License

This project is proprietary to Sitefy.co. All rights reserved.
