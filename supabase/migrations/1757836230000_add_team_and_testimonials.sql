/*
# [Schema] Create Team & Testimonials Tables and Policies (Idempotent)

This migration creates the necessary tables for the team members and user testimonials features. It also sets up the required storage buckets and Row Level Security (RLS) policies.

## Query Description:
This script is designed to be idempotent, meaning it can be run multiple times without causing errors. It will check for the existence of objects (tables, policies, buckets) before attempting to create them. No data will be lost by running this script.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (manually, by dropping created objects)

## Structure Details:
- Tables created: `team_members`, `testimonials`, `team_applications`
- Policies created: Public read for team/testimonials, authenticated insert for testimonials, public insert for applications.
- Storage Buckets created: `team_applications_cvs`

## Security Implications:
- RLS Status: Enabled on all new tables.
- Policy Changes: Yes, new policies are added for the new tables.
- Auth Requirements: Policies are based on public, authenticated, and admin roles.

## Performance Impact:
- Indexes: Primary keys are indexed automatically.
- Triggers: None.
- Estimated Impact: Low.
*/

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    role text NOT NULL,
    department text CHECK (department IN ('Direction', 'Technique', 'Médical', 'Opérations')) NOT NULL,
    bio text NOT NULL,
    avatar_url text NOT NULL,
    linkedin_url text,
    twitter_url text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members
DROP POLICY IF EXISTS "Allow public read access to team members" ON public.team_members;
CREATE POLICY "Allow public read access to team members" ON public.team_members FOR SELECT USING (true);


-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    location text,
    content text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    status text DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
DROP POLICY IF EXISTS "Allow public read access to approved testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access to approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved'::text);

DROP POLICY IF EXISTS "Allow authenticated users to submit testimonials" ON public.testimonials;
CREATE POLICY "Allow authenticated users to submit testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to see their own pending testimonials" ON public.testimonials;
CREATE POLICY "Allow users to see their own pending testimonials" ON public.testimonials FOR SELECT USING (auth.uid() = user_id);


-- Create team_applications table
CREATE TABLE IF NOT EXISTS public.team_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    role_applied_for text NOT NULL,
    cv_url text NOT NULL,
    cover_letter text,
    status text DEFAULT 'pending'::text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for team_applications
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- Policies for team_applications
DROP POLICY IF EXISTS "Allow anyone to submit an application" ON public.team_applications; -- Drop old one if it exists
DROP POLICY IF EXISTS "Allow anyone to submit a team application" ON public.team_applications;
CREATE POLICY "Allow anyone to submit a team application" ON public.team_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to manage applications" ON public.team_applications; -- Drop old one if it exists
DROP POLICY IF EXISTS "Allow admins to manage team applications" ON public.team_applications;
CREATE POLICY "Allow admins to manage team applications" ON public.team_applications FOR ALL USING (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')) WITH CHECK (((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'));


-- Create Storage Bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('team_applications_cvs', 'team_applications_cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for team_applications_cvs bucket
DROP POLICY IF EXISTS "Allow public upload to team_applications_cvs bucket" ON storage.objects;
CREATE POLICY "Allow public upload to team_applications_cvs bucket"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK ( bucket_id = 'team_applications_cvs' );

DROP POLICY IF EXISTS "Allow admin read access to team_applications_cvs" ON storage.objects;
CREATE POLICY "Allow admin read access to team_applications_cvs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'team_applications_cvs' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
