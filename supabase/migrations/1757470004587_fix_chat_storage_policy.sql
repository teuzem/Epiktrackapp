/*
# [Fix] Chat Storage RLS Policies
Corrects a syntax error in the Row Level Security policies for the chat_files storage bucket.

## Query Description: This migration fixes a syntax error (a trailing comma) in the previous migration attempt. It safely re-declares the policies for accessing files uploaded in the chat, ensuring that only the sender and receiver of a message can access the associated files. This has no impact on existing data as the previous migration failed.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- storage.buckets: Creates 'chat_files' if it doesn't exist.
- storage.objects: Applies RLS policies to files within 'chat_files'.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (Corrects faulty policies)
- Auth Requirements: Users must be authenticated.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible.
*/

-- 1. Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_files', 'chat_files', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;


-- 2. Create RLS policies for chat_files bucket

-- Drop existing policies if they were partially created (defensive)
DROP POLICY IF EXISTS "Allow sender to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow participants to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow sender to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow sender to delete files" ON storage.objects;


-- Allow authenticated users to upload files.
-- Supabase automatically sets `owner_id` to `auth.uid()` on upload.
CREATE POLICY "Allow sender to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'chat_files' AND
    owner_id = auth.uid()
);


-- Allow users to view files if they are the sender or receiver of the message containing the file.
CREATE POLICY "Allow participants to view files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    (
        auth.uid() IN (
            SELECT sender_id FROM public.messages WHERE file_url LIKE '%' || storage.objects.name
            UNION ALL
            SELECT receiver_id FROM public.messages WHERE file_url LIKE '%' || storage.objects.name
        )
    )
);


-- Allow the sender to update their own files.
CREATE POLICY "Allow sender to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    auth.uid() = owner_id
);

-- Allow the sender to delete their own files.
CREATE POLICY "Allow sender to delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    auth.uid() = owner_id
);
