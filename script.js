// Mobile Navigation Toggle (DOM ready)
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) {
        console.warn('Mobile menu: .hamburger or .nav-menu not found');
        return;
    }

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const openMenu = (open) => {
        const willOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', willOpen);
        hamburger.classList.toggle('active', willOpen);
        hamburger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        document.body.classList.toggle('nav-open', willOpen);
    };

    // Toggle main menu
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        openMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            openMenu(false);
            // close any open submenus
            document.querySelectorAll('.has-submenu.open, .nav-item.open').forEach(el => el.classList.remove('open'));
            // reset inline maxHeight used for mobile submenu animation
            document.querySelectorAll('.has-submenu .submenu').forEach(sub => sub.style.maxHeight = null);
        }
    });

    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
        if (!isMobile()) openMenu(false);
    });

    // Links behavior: close main menu when clicking a normal link on mobile
    navMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (ev) => {
            // If this link is a submenu toggle (has-submenu parent), let submenu handler manage it
            const parentItem = a.closest('.has-submenu, .nav-item');
            const hasSubmenu = parentItem && parentItem.querySelector('.submenu, .dropdown-menu, .mega-menu');
            if (isMobile() && !hasSubmenu) {
                openMenu(false);
            }
        });
    });

    // Mobile submenu toggles for any .has-submenu
    document.querySelectorAll('.has-submenu').forEach(item => {
        // prefer explicit toggle button if present
        const toggle = item.querySelector('.submenu-toggle') || item.querySelector('.has-submenu-link') || item.querySelector('a');
        const submenu = item.querySelector('.submenu');

        if (!toggle || !submenu) return;

        toggle.addEventListener('click', (ev) => {
            if (!isMobile()) return; // desktop uses hover
            ev.preventDefault();
            ev.stopPropagation();
            item.classList.toggle('open');
            if (item.classList.contains('open')) {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            } else {
                submenu.style.maxHeight = null;
            }
        });
    });

    // Top-level dropdown parents (e.g. .nav-item.dropdown) should toggle on mobile
    navMenu.querySelectorAll('.nav-item.dropdown > .nav-link').forEach(link => {
        link.addEventListener('click', function(ev) {
            if (!isMobile()) return; // desktop hover
            const parent = this.closest('.nav-item');
            const menu = parent && parent.querySelector('.dropdown-menu, .mega-menu');
            if (!menu) return;
            ev.preventDefault();
            ev.stopPropagation();
            const opened = parent.classList.toggle('open');

            // Close sibling open items to keep it tidy on mobile
            if (opened && parent.parentElement) {
                parent.parentElement.querySelectorAll('.nav-item.open').forEach(sib => {
                    if (sib !== parent) {
                        sib.classList.remove('open');
                        sib.querySelectorAll('.submenu').forEach(s => s.style.maxHeight = null);
                    }
                });
            }
        });
    });
});

// Review Type Toggle
const reviewTypeInputs = document.querySelectorAll('input[name="reviewType"]');
const textReviewSection = document.getElementById('textReviewSection');
const videoReviewSection = document.getElementById('videoReviewSection');

reviewTypeInputs.forEach(input => {
    input.addEventListener('change', function() {
        if (this.value === 'text') {
            textReviewSection.style.display = 'flex';
            videoReviewSection.style.display = 'none';
            document.getElementById('reviewText').required = true;
            document.getElementById('videoUpload').required = false;
        } else if (this.value === 'video') {
            textReviewSection.style.display = 'none';
            videoReviewSection.style.display = 'flex';
            document.getElementById('reviewText').required = false;
            document.getElementById('videoUpload').required = true;
        } else if (this.value === 'both') {
            textReviewSection.style.display = 'flex';
            videoReviewSection.style.display = 'flex';
            // Require BOTH text and video for 'both'
            document.getElementById('reviewText').required = true;
            document.getElementById('videoUpload').required = true;
        }
    });
});

// Video Upload Handling
const videoUpload = document.getElementById('videoUpload');
const videoPreview = document.getElementById('videoPreview');
const uploadPlaceholder = document.querySelector('.upload-placeholder');

videoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size too large. Please select a video under 50MB.');
            this.value = '';
            return;
        }

        // Check if it's a video file
        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            this.value = '';
            return;
        }

        const url = URL.createObjectURL(file);
        const video = videoPreview.querySelector('video');
        video.src = url;
        
        // Check video duration when metadata loads
        video.addEventListener('loadedmetadata', function() {
            if (this.duration > 60) {
                alert('Video duration exceeds 1 minute. Please select a shorter video.');
                removeVideo();
                return;
            }
        });

        uploadPlaceholder.style.display = 'none';
        videoPreview.style.display = 'block';
    }
});

// Remove Video Function
function removeVideo() {
    const video = videoPreview.querySelector('video');
    video.src = '';
    videoUpload.value = '';
    uploadPlaceholder.style.display = 'block';
    videoPreview.style.display = 'none';
}

// Star Rating Functionality
const starInputs = document.querySelectorAll('.star-rating input');
const starLabels = document.querySelectorAll('.star-rating label');

// Add hover effects and click handlers
starLabels.forEach((label, index) => {
    // Hover effect
    label.addEventListener('mouseenter', function() {
        highlightStars(index + 1); // +1 because we want to highlight from 1 to current star
    });
    
    // Click handler
    label.addEventListener('click', function() {
        const starValue = index + 1; // Stars are now in order 1-5
        const correspondingInput = document.getElementById(`star${starValue}`);
        correspondingInput.checked = true;
        highlightStars(starValue, true);
    });
});

// Mouse leave - reset to selected rating
document.querySelector('.star-rating').addEventListener('mouseleave', function() {
    const checkedInput = document.querySelector('.star-rating input:checked');
    if (checkedInput) {
        const rating = parseInt(checkedInput.value);
        highlightStars(rating, true);
    } else {
        resetStars();
    }
});

function highlightStars(rating, permanent = false) {
    starLabels.forEach((label, i) => {
        if (i < rating) { // Highlight stars from left up to the rating
            label.style.color = '#fbbf24';
        } else {
            label.style.color = '#ddd';
        }
    });
}

function resetStars() {
    starLabels.forEach(label => {
        label.style.color = '#ddd';
    });
}

// Form Validation and Submission
const reviewForm = document.getElementById('reviewForm');

reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    
    // Validate required fields
    const userName = formData.get('userName');
    const userEmail = formData.get('userEmail');
    const projectName = formData.get('projectName');
    const rating = formData.get('rating');
    const reviewType = formData.get('reviewType');
    
    if (!userName || !userEmail || !projectName || !rating) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate tags (at least one should be selected)
    const selectedTags = formData.getAll('tags');
    if (selectedTags.length === 0) {
        alert('Please select at least one project category/tag.');
        return;
    }

    // Validate review content based on type
    const reviewText = formData.get('reviewText');
    const videoFile = formData.get('videoUpload');

    if (reviewType === 'text') {
        if (!reviewText || reviewText.trim().length < 10) {
            alert('Please write a meaningful review (at least 10 characters).');
            return;
        }
    } else if (reviewType === 'video') {
        if (!videoFile || videoFile.size === 0) {
            alert('Please upload a video review.');
            return;
        }
    } else if (reviewType === 'both') {
        if (!reviewText || reviewText.trim().length < 10) {
            alert('Please write a meaningful review (at least 10 characters).');
            return;
        }
        if (!videoFile || videoFile.size === 0) {
            alert('Please upload a video review.');
            return;
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    // Submit to backend
    submitReview(formData)
        .then(response => {
            if (response.success) {
                alert('Thank you for your review! It will be published after moderation.');
                
                // Reset form
                reviewForm.reset();
                removeVideo();
                
                // Reset star rating visual state
                document.querySelectorAll('.star-rating label').forEach(label => {
                    label.style.color = '';
                });
                
                // Reset review type to text
                document.getElementById('text-review').checked = true;
                textReviewSection.style.display = 'flex';
                videoReviewSection.style.display = 'none';
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Error: ' + response.message);
            }
        })
        .catch(error => {
            console.error('Submission error:', error);
            alert('Failed to submit review. Please try again.');
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
});

// Function to submit review to backend
async function submitReview(formData) {
    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Network error:', error);
        throw new Error('Network error occurred');
    }
}

// Smooth scroll for internal links
// Smooth scroll for internal links (guard invalid selectors like '#')
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href) return;

        // If href is exactly '#' -> treat as scroll-to-top
        if (href === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // For other hash links, ensure we have a valid selector (length > 1)
        if (href.length > 1 && href.startsWith('#')) {
            // Protect against invalid selectors (e.g. malformed ids)
            let target = null;
            try {
                target = document.querySelector(href);
            } catch (err) {
                // invalid selector, do nothing
                return;
            }

            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Form field animations
const formInputs = document.querySelectorAll('input, textarea');
formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
    
    // Check if field has value on page load
    if (input.value) {
        input.parentElement.classList.add('focused');
    }
});

// Character counter for text review
const reviewTextArea = document.getElementById('reviewText');
if (reviewTextArea) {
    const maxLength = 1000;
    
    // Create character counter element
    const counterElement = document.createElement('div');
    counterElement.className = 'character-counter';
    counterElement.style.cssText = 'font-size: 0.9rem; color: #6b7280; text-align: right; margin-top: 0.5rem;';
    reviewTextArea.parentElement.appendChild(counterElement);
    
    function updateCounter() {
        const currentLength = reviewTextArea.value.length;
        counterElement.textContent = `${currentLength}/${maxLength} characters`;
        
        if (currentLength > maxLength * 0.9) {
            counterElement.style.color = '#ef4444';
        } else if (currentLength > maxLength * 0.7) {
            counterElement.style.color = '#f59e0b';
        } else {
            counterElement.style.color = '#6b7280';
        }
    }
    
    reviewTextArea.addEventListener('input', updateCounter);
    reviewTextArea.maxLength = maxLength;
    updateCounter(); // Initial call
}

// Auto-resize textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // Initial resize
    autoResizeTextarea(textarea);
});

// Add loading animation for better UX
function addLoadingStates() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit') {
                return; // Handle submit button separately
            }
            
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1000);
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    addLoadingStates();
    
    // Add fade-in animation to elements
    const animatedElements = document.querySelectorAll('.review-card, .form-container');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Smart position dropdowns on desktop so they always fit the viewport
    initDropdownPositioning();
});

// Handle form field validation in real-time
function addRealTimeValidation() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field validation
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // Text area minimum length
    if (field.tagName === 'TEXTAREA' && field.id === 'reviewText' && value) {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Please write at least 10 characters.';
        }
    }
    
    // Add error styling if invalid
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 0.25rem;';
        field.parentElement.appendChild(errorDiv);
    }
    
    return isValid;
}

// Add CSS for error states
const errorStyles = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// Initialize real-time validation
document.addEventListener('DOMContentLoaded', function() {
    addRealTimeValidation();
    loadApprovedReviews();
});

// --- Dropdown smart positioning (desktop) ---
function isDesktop() {
    return window.matchMedia('(min-width: 769px)').matches;
}

function initDropdownPositioning() {
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    dropdownItems.forEach(item => {
        const menu = item.querySelector('.dropdown-menu, .mega-menu');
        if (!menu) return;

        // On open, do not reposition; keep natural placement to avoid jump
        item.addEventListener('mouseenter', () => {
            /* intentionally no-op on desktop to prevent initial jump */
        });

        item.addEventListener('mouseleave', () => {
            resetDropdownPosition(menu);
        });

        // Also reposition nested submenus
        menu.querySelectorAll('.has-submenu').forEach(li => {
            const sub = li.querySelector('.submenu');
            if (!sub) return;
            li.addEventListener('mouseenter', () => {
                if (!isDesktop()) return;
                // Only flip horizontally if needed; avoid vertical shift on open
                requestAnimationFrame(() => positionSubmenu(sub, true));
            });
            li.addEventListener('mouseleave', () => resetSubmenuPosition(sub));
        });
    });

    // Track scroll/resize to keep open menus fitted
    const onViewportChange = () => {
        if (!isDesktop()) return;
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            const menu = item.querySelector('.dropdown-menu, .mega-menu');
            if (!menu) return;
            if (item.matches(':hover')) {
                positionDropdown(menu);
                // Also adjust any visible submenus
                menu.querySelectorAll('.has-submenu').forEach(li => {
                    const sub = li.querySelector('.submenu');
                    if (sub && li.matches(':hover')) positionSubmenu(sub, false);
                });
            }
        });
    };
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);
}

function positionDropdown(menu) {
    if (!menu) return;
    // Reset first
    menu.style.transform = 'translateY(0)';
    menu.style.top = '100%';

    const margin = 12;
    const rect = menu.getBoundingClientRect();
    let shift = 0;
    if (rect.bottom > window.innerHeight - margin) {
        shift -= (rect.bottom - (window.innerHeight - margin));
    }
    if (rect.top < margin) {
        shift += (margin - rect.top);
    }
    if (shift !== 0) {
        menu.style.transform = `translateY(${shift}px)`;
    }
}

function resetDropdownPosition(menu) {
    if (!menu) return;
    menu.style.transform = '';
    menu.style.top = '';
}

function positionSubmenu(sub, initial = false) {
    if (!sub) return;
    // Default: open to the right
    sub.style.left = '100%';
    sub.style.right = 'auto';
    sub.style.marginLeft = '8px';
    sub.style.marginRight = '0';
    sub.style.transform = 'translateY(0)';

    const margin = 12;
    let rect = sub.getBoundingClientRect();

    // If overflow right, flip to left
    if (rect.right > window.innerWidth - margin) {
        sub.style.left = 'auto';
        sub.style.right = '100%';
        sub.style.marginLeft = '0';
        sub.style.marginRight = '8px';
        rect = sub.getBoundingClientRect();
    }

    if (!initial) {
        // Vertical fit only during scroll/resize adjustments
        let shift = 0;
        if (rect.bottom > window.innerHeight - margin) {
            shift -= (rect.bottom - (window.innerHeight - margin));
        }
        if (rect.top < margin) {
            shift += (margin - rect.top);
        }
        if (shift !== 0) sub.style.transform = `translateY(${shift}px)`;
    }
}

function resetSubmenuPosition(sub) {
    if (!sub) return;
    sub.style.left = '';
    sub.style.right = '';
    sub.style.marginLeft = '';
    sub.style.marginRight = '';
    sub.style.transform = '';
}

// Function to load approved reviews from backend
async function loadApprovedReviews() {
    try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            renderReviews(data.data);
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        // Keep the static reviews as fallback
    }
}

// Function to render reviews
function renderReviews(reviews) {
    const reviewsGrid = document.querySelector('.reviews-grid');
    
    // Clear existing reviews (keep first 3 as samples if no backend reviews)
    if (reviews.length > 0) {
        reviewsGrid.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewCard = createReviewCard(review);
            reviewsGrid.appendChild(reviewCard);
        });
    }
}

// Function to create review card element
function createReviewCard(review) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    const tagsHtml = review.tags.map(tag => `<span class="tag">#${tag.replace(/\s+/g, '')}</span>`).join('');
    const starsHtml = review.hide_rating ? '' : ('★'.repeat(review.rating) + '☆'.repeat(5 - review.rating));
    const reviewDate = new Date(review.created_at).toLocaleDateString();

    let contentSections = '';
    if (review.review_text) {
        contentSections += `<p>${escapeHtml(review.review_text)}</p>`;
    }
    if (review.video_url) {
        contentSections += `
            <div class="review-video" style="margin-top: 0.75rem;">
                <video controls style="width: 100%; max-height: 300px; border-radius: 8px;">
                    <source src="${review.video_url}">
                    Your browser does not support the video tag.
                </video>
            </div>`;
    }
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <h4>${escapeHtml(review.user_name)}</h4>
                <p>${escapeHtml(review.user_title || 'Customer')}</p>
            </div>
            <div class="review-rating">
                ${review.hide_rating ? '' : `<span class="stars">${starsHtml}</span>`}
            </div>
        </div>
        <div class="review-content">
            <div class="review-project">
                <strong>Project:</strong> ${escapeHtml(review.project_name)}
            </div>
            <div class="review-tags">
                ${tagsHtml}
            </div>
            ${contentSections}
            <div class="review-date">
                <small>Reviewed on ${reviewDate}</small>
            </div>
        </div>
    `;
    
    return reviewCard;
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// In-browser video recording using MediaRecorder
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordTimerInterval = null;
let elapsedSec = 0;

const startBtn = document.getElementById('startRecordBtn');
const stopBtn = document.getElementById('stopRecordBtn');
const recorderPreview = document.getElementById('recorderPreview');

function fmt(t){ const m = String(Math.floor(t/60)).padStart(2,'0'); const s = String(t%60).padStart(2,'0'); return `${m}:${s}`; }
function setTimer(t){ const el = document.getElementById('recordTimer'); if(el) el.textContent = fmt(t); }

async function startRecording(){
    try {
        recordedChunks = [];
        elapsedSec = 0;
        setTimer(0);
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        recorderPreview.srcObject = mediaStream;
        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: mime });
        mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = handleRecordingStop;
        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        recordTimerInterval = setInterval(() => {
            elapsedSec += 1;
            setTimer(elapsedSec);
            if (elapsedSec >= 60) stopRecording();
        }, 1000);
    } catch (err) {
        alert('Camera/microphone access denied or unavailable.');
        console.error(err);
    }
}

function stopRecording(){
    try { mediaRecorder && mediaRecorder.state !== 'inactive' && mediaRecorder.stop(); } catch {}
    stopBtn.disabled = true;
    startBtn.disabled = false;
    clearInterval(recordTimerInterval);
    recordTimerInterval = null;
    setTimer(0);
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
}

async function handleRecordingStop(){
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    // Build a File from blob and attach to the hidden file input
    const file = new File([blob], `review-${Date.now()}.webm`, { type: 'video/webm' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    videoUpload.files = dataTransfer.files;

    // Show in preview
    const url = URL.createObjectURL(blob);
    const video = videoPreview.querySelector('video');
    video.src = url;
    uploadPlaceholder.style.display = 'none';
    videoPreview.style.display = 'block';
}

if (startBtn && stopBtn) {
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
}
