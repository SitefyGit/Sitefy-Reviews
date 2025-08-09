-- Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_title VARCHAR(255),
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    tags TEXT[] NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    hide_rating BOOLEAN DEFAULT FALSE,
    review_type VARCHAR(10) NOT NULL CHECK (review_type IN ('text', 'video', 'both')),
    review_text TEXT,
    video_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_tags ON public.reviews USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to approved reviews
CREATE POLICY "Allow public read access to approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

-- Create policy for inserting new reviews (anyone can submit)
CREATE POLICY "Allow insert for authenticated users" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Create policy for admin access (you'll need to customize this based on your auth setup)
-- This is a basic policy - in production, you should restrict this to actual admin users
CREATE POLICY "Allow admin full access" ON public.reviews
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'email' IN ('admin@sitefy.co', 'sufiyan@sitefy.co')
    );

-- Create storage bucket for review media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'review-media',
    'review-media',
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access to review media" ON storage.objects
    FOR SELECT USING (bucket_id = 'review-media');

CREATE POLICY "Allow authenticated users to upload review media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'review-media' AND
        (storage.foldername(name))[1] = 'review-videos'
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample approved reviews for display
INSERT INTO public.reviews (
    user_name, user_email, user_title, project_name, project_description,
    tags, rating, review_type, review_text, status
) VALUES 
(
    'John Doe',
    'john@example.com',
    'College Graduate',
    'E-commerce Website Development',
    'Built a complete dropshipping store with Sitefy',
    ARRAY['Website Development', 'Online Business'],
    5,
    'text',
    'This is how a customer help service should be. I feel like we are working together. They know their systems very well. I would rate this service as excellent- very speedy- polite- friendly- 5 Star. Well done, Sitefy team!',
    'approved'
),
(
    'Dek Merik',
    'dek@example.com',
    'Product Manager',
    'Marketing Campaign Setup',
    'Complete social media marketing setup for my business',
    ARRAY['Marketing Services', 'IT Project'],
    5,
    'text',
    'The team at Sitefy have been wonderful any time I''ve had a problem with my website. Their response time is quick and everyone I''ve encountered has been kind, patient and very professional!',
    'approved'
),
(
    'Dev Patel',
    'dev@example.com',
    'Software Engineer',
    'SaaS Platform Development',
    'Custom SaaS application built from scratch',
    ARRAY['SaaS Project', 'Website Development'],
    5,
    'text',
    'Highly recommended, the customer support is awesome. They respond very quick. Keep it up.',
    'approved'
),
(
    'Rakhi Jain',
    'rakhi@example.com',
    'Operation Executive',
    'Business Process Automation',
    'Automated our entire business workflow',
    ARRAY['IT Project', 'Online Business'],
    5,
    'text',
    'Professional service, it deserves more than 5 stars, especially customer service, help until the problem is resolved.',
    'approved'
);

-- Create a view for public review display (optional, for better performance)
CREATE OR REPLACE VIEW public.approved_reviews AS
SELECT 
    id,
    user_name,
    user_title,
    project_name,
    project_description,
    tags,
    rating,
    hide_rating,
    review_type,
    review_text,
    video_url,
    created_at
FROM public.reviews
WHERE status = 'approved'
ORDER BY created_at DESC;
