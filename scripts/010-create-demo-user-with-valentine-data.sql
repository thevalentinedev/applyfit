-- Create demo user with Valentine's specific information
-- This preserves the original data for demonstration purposes

-- Insert demo user (if not exists)
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@applyfit.dev',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert comprehensive demo profile with Valentine's data
INSERT INTO user_profiles (
  id,
  user_id,
  email,
  full_name,
  phone,
  location,
  website,
  linkedin_url,
  github_url,
  bio,
  education,
  professional_experience,
  projects_achievements,
  skills,
  experience_level,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'demo@applyfit.dev',
  'Valentine Ohalebo',
  '+1 647 282 8563',
  'Waterloo, ON',
  'https://valentine.dev',
  'https://www.linkedin.com/in/valentine-ohalebo-51bb37221/',
  'https://github.com/thevalentinedev',
  'Full-Stack Developer & Creator passionate about building user-centric web applications with modern technologies.',
  '[
    {
      "institution": "Conestoga College",
      "degree": "Ontario College Diploma",
      "field_of_study": "Computer Programming",
      "start_date": "2022-09-01",
      "end_date": "2025-04-30",
      "gpa": "3.92",
      "description": "High Distinction - GPA: 3.92. Relevant Coursework: Web Development, Object-Oriented Programming, UI/UX Design, Data Structures. Academic Excellence: Best Final Year Project, Tech Showcase 2025, Best of Program Award."
    }
  ]',
  '[
    {
      "company": "Auviel",
      "position": "Software Developer",
      "location": "Remote",
      "start_date": "2024-06-01",
      "end_date": null,
      "is_current": true,
      "description": "• Develop and maintain full-stack web applications using React, Next.js, and Node.js\n• Implement responsive user interfaces and optimize application performance\n• Collaborate with cross-functional teams to deliver user-centric solutions\n• Participate in code reviews and maintain high code quality standards"
    },
    {
      "company": "Naija Jollof",
      "position": "Frontend Developer",
      "location": "Remote",
      "start_date": "2024-01-01",
      "end_date": "2024-06-30",
      "is_current": false,
      "description": "• Built responsive web application for Nigerian food delivery service\n• Focused on SEO optimization and accessibility improvements\n• Enhanced user experience through modern UI/UX design principles\n• Implemented performance optimizations reducing load times"
    }
  ]',
  '[
    {
      "title": "GeoEvent Platform",
      "description": "Geolocation-based event aggregation platform built with Next.js and Supabase. Features Google Maps API integration, real-time data updates, and mobile-first design for student meetups and local event discovery.",
      "technologies": ["React", "Next.js", "TypeScript", "Supabase", "Google Maps API", "Tailwind CSS"],
      "start_date": "2024-01-01",
      "end_date": null,
      "is_ongoing": true,
      "demo_url": "https://geoevent.ca",
      "github_url": null
    },
    {
      "title": "ImageMark - Creator & Developer",
      "description": "Watermarking application with 10k+ operations processed. Implemented smart positioning algorithms using Canvas API. Built with React, TypeScript, and modern web technologies focusing on user experience and performance.",
      "technologies": ["React", "TypeScript", "Canvas API", "JavaScript", "CSS"],
      "start_date": "2023-08-01",
      "end_date": null,
      "is_ongoing": true,
      "demo_url": null,
      "github_url": null
    },
    {
      "title": "Naija Jollof Website",
      "description": "E-commerce platform for Nigerian food delivery service. SEO-optimized with accessibility features and responsive design for mobile and desktop users.",
      "technologies": ["React", "Next.js", "CSS", "SEO", "Accessibility"],
      "start_date": "2024-02-01",
      "end_date": "2024-05-31",
      "is_ongoing": false,
      "demo_url": "https://naijajollofw.ca",
      "github_url": null
    }
  ]',
  '["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "HTML", "CSS", "Git", "GitHub", "Supabase", "PostgreSQL", "Tailwind CSS", "Canvas API", "Google Maps API", "SEO", "Accessibility", "Responsive Design"]',
  'Mid-level',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  linkedin_url = EXCLUDED.linkedin_url,
  github_url = EXCLUDED.github_url,
  bio = EXCLUDED.bio,
  education = EXCLUDED.education,
  professional_experience = EXCLUDED.professional_experience,
  projects_achievements = EXCLUDED.projects_achievements,
  skills = EXCLUDED.skills,
  experience_level = EXCLUDED.experience_level,
  updated_at = NOW();
