-- =====================================================================
-- SUPABASE DATABASE SCHEMA FOR NHEB PANHA PORTFOLIO
-- Execute this SQL script in your Supabase SQL Editor.
-- Safe to re-run: tables, columns, policies and seed rows are only created once.
-- =====================================================================

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'logos:flutter',
    logo TEXT,
    link TEXT DEFAULT '#',
    github_url TEXT DEFAULT '#',
    demo_url TEXT,
    status TEXT,
    featured BOOLEAN DEFAULT true,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Columns added later (safe to re-run on an existing table)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS projects_title_key ON public.projects (title);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to projects
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
CREATE POLICY "Allow public read access to projects"
ON public.projects FOR SELECT 
USING (true);

-- 2. Create Contact Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'General Inquiry',
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for contact submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact submissions
DROP POLICY IF EXISTS "Allow public to submit contact messages" ON public.contact_submissions;
CREATE POLICY "Allow public to submit contact messages" 
ON public.contact_submissions FOR INSERT 
WITH CHECK (true);

-- 3. Create AI Chat Logs Table
CREATE TABLE IF NOT EXISTS public.chat_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_prompt TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chat logs
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Allow public insert for chat logs
DROP POLICY IF EXISTS "Allow public to record chat logs" ON public.chat_logs;
CREATE POLICY "Allow public to record chat logs" 
ON public.chat_logs FOR INSERT 
WITH CHECK (true);


-- =====================================================================
-- ADMIN ACCESS (used by the /admin dashboard)
-- 1. Create your login in Supabase: Authentication -> Users -> Add user
--    (email + password, tick "Auto confirm user").
-- 2. Make sure that same email is listed in admin_users below.
-- 3. Recommended: Authentication -> Sign In / Providers -> turn OFF "Allow new users to sign up".
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS on with no policies: nobody can read or edit this list through the API.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Change this to the email you sign in to /admin with (add more rows for more admins).
INSERT INTO public.admin_users (email) VALUES ('nhebpanha78@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- True when the signed-in user's email is in admin_users.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Admins can create, read, update and delete everything the dashboard manages.
DROP POLICY IF EXISTS "Admins manage projects" ON public.projects;
CREATE POLICY "Admins manage projects" ON public.projects
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins manage contact submissions" ON public.contact_submissions
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage chat logs" ON public.chat_logs;
CREATE POLICY "Admins manage chat logs" ON public.chat_logs
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- =====================================================================
-- SAMPLE SEED DATA FOR PROJECTS
-- =====================================================================

INSERT INTO public.projects (title, category, description, icon, link, github_url, featured, tags)
VALUES
(
    'RED ANT Express',
    'E-Commerce',
    'Customer shopping app for the RED ANT Express e-commerce platform: browse products, add them to the cart, check out and track orders through to delivery.',
    'devicon:flutter',
    '#',
    '#',
    true,
    '[{"name":"Flutter","icon":"devicon:flutter"},{"name":"Dart","icon":"logos:dart"}]'::jsonb
),
(
    'RED ANT Merchant',
    'Merchant App',
    'Seller app for RED ANT Express that lets merchants manage their products and incoming orders, and prepare each order for delivery.',
    'devicon:flutter',
    '#',
    '#',
    true,
    '[{"name":"Flutter","icon":"devicon:flutter"},{"name":"Dart","icon":"logos:dart"}]'::jsonb
),
(
    'RED ANT Driver',
    'Delivery App',
    'Driver app for RED ANT Express for accepting delivery jobs, picking up orders from merchants and updating each order through to drop-off.',
    'devicon:flutter',
    '#',
    '#',
    true,
    '[{"name":"Flutter","icon":"devicon:flutter"},{"name":"Dart","icon":"logos:dart"}]'::jsonb
),
(
    'E-Shop Native',
    'E-Commerce',
    'Native mobile shopping app for Android and iOS covering product browsing, cart and checkout.',
    'logos:kotlin-icon',
    '#',
    '#',
    true,
    '[{"name":"Kotlin","icon":"logos:kotlin-icon"},{"name":"Swift","icon":"logos:swift"}]'::jsonb
)
ON CONFLICT (title) DO NOTHING;

-- Project logos (images live in public/image/projects/)
UPDATE public.projects SET logo = '/image/projects/red-ant-express.png'  WHERE title = 'RED ANT Express';
UPDATE public.projects SET logo = '/image/projects/red-ant-merchant.png' WHERE title = 'RED ANT Merchant';
UPDATE public.projects SET logo = '/image/projects/red-ant-driver.png'   WHERE title = 'RED ANT Driver';
UPDATE public.projects SET logo = '/image/projects/e-shop-native.png'    WHERE title = 'E-Shop Native';


-- 4. Create Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    read_time TEXT DEFAULT '5 min read',
    published_at TEXT DEFAULT 'Jul 2025',
    author TEXT DEFAULT 'Nheb Panha',
    tags JSONB DEFAULT '[]'::jsonb,
    icon TEXT DEFAULT 'logos:flutter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to blog posts
DROP POLICY IF EXISTS "Allow public read access to blog_posts" ON public.blog_posts;
CREATE POLICY "Allow public read access to blog_posts"
ON public.blog_posts FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins manage blog posts" ON public.blog_posts
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.blog_posts (title, slug, category, summary, content, read_time, published_at, author, tags, icon)
VALUES
(
    'Building Real-Time Mobile Apps with Flutter & Supabase',
    'flutter-supabase-realtime',
    'Mobile Architecture',
    'A practical guide to implementing BLoC state isolation, Supabase Row-Level Security (RLS), and offline-first Hive caching in Flutter production apps.',
    'Building real-time mobile applications requires a decoupled architecture that balances UI responsiveness, local data caching, and secure cloud synchronization.',
    '5 min read',
    'Jul 2025',
    'Nheb Panha',
    '["Flutter", "Supabase", "BLoC", "PostgreSQL"]'::jsonb,
    'logos:flutter'
),
(
    'Optimizing Nuxt 3 SSR & Glassmorphism Design Tokens',
    'nuxt3-ssr-glassmorphism',
    'Frontend Engineering',
    'How to craft ultra-fast Vue 3 applications using Nuxt 3 server-side rendering, dynamic dark mode themes, and performance-first CSS glass utilities.',
    'Modern web interfaces must deliver immediate visual impact without sacrificing Lighthouse web vitals or page transition speeds.',
    '4 min read',
    'Jun 2025',
    'Nheb Panha',
    '["Nuxt 3", "Vue 3", "Tailwind CSS", "SSR"]'::jsonb,
    'logos:nuxt-icon'
)
ON CONFLICT (slug) DO NOTHING;
