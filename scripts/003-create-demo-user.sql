-- Note: This is for development/testing only
-- In production, users should be created through the normal signup flow

-- Insert demo user (this would normally be done through Supabase Auth)
-- You'll need to create this user through Supabase dashboard or auth API
-- Email: demouser@gmail.com
-- Password: demouser

-- Create demo user profile (assuming the auth user exists)
-- This will be created automatically by the trigger, but we can update it with demo data
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Try to find the demo user (you'll need to replace this with actual UUID from Supabase)
    -- This is just a placeholder - the actual user_id will come from Supabase Auth
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demouser@gmail.com' LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Update the demo user profile with sample data
        UPDATE user_profiles SET
            full_name = 'Demo User',
            bio = 'This is a demo account for testing the ApplyFit resume generator.',
            location = 'San Francisco, CA',
            experience_level = 'mid',
            skills = ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            preferred_job_types = ARRAY['Full-time', 'Remote'],
            salary_range_min = 80000,
            salary_range_max = 120000,
            linkedin_url = 'https://linkedin.com/in/demouser',
            github_url = 'https://github.com/demouser',
            updated_at = now()
        WHERE user_id = demo_user_id;
        
        -- Insert some sample job applications
        INSERT INTO job_applications (user_id, company_name, job_title, job_link, date_applied, status) VALUES
            (demo_user_id, 'Google', 'Software Engineer', 'https://careers.google.com/jobs/123', CURRENT_DATE - INTERVAL '5 days', 'applied'),
            (demo_user_id, 'Microsoft', 'Frontend Developer', 'https://careers.microsoft.com/jobs/456', CURRENT_DATE - INTERVAL '10 days', 'interviewed'),
            (demo_user_id, 'Apple', 'Full Stack Developer', 'https://jobs.apple.com/jobs/789', CURRENT_DATE - INTERVAL '15 days', 'rejected'),
            (demo_user_id, 'Meta', 'React Developer', 'https://careers.meta.com/jobs/101', CURRENT_DATE - INTERVAL '3 days', 'applied');
    END IF;
END $$;
