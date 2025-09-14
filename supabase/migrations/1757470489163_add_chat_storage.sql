/*
          # [Structural] Create Chat Files Storage Bucket
          [This operation creates a new storage bucket for chat files and sets up Row Level Security policies.]

          ## Query Description: [This operation is safe and structural. It creates a new storage bucket named `chat_files` to store images and documents exchanged in the instant messaging module. It also configures security policies to ensure that only the sender and receiver of a message can access the associated files, thus protecting user privacy.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Storage Bucket: `chat_files`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes
          - Auth Requirements: Users must be authenticated.
          
          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

-- 1. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_files', 'chat_files', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects for the new bucket
-- This is handled by the policies below.

-- 3. Create Security Policies
-- Allow users to view files they have sent or received
CREATE POLICY "Chat participants can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat_files' AND
  auth.uid() IN (
    SELECT sender_id FROM public.messages WHERE file_url LIKE '%' || storage.objects.name,
    SELECT receiver_id FROM public.messages WHERE file_url LIKE '%' || storage.objects.name
  )
);

-- Allow users to upload files for messages they are sending
CREATE POLICY "Users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat_files' AND
  auth.uid() = (storage.object_metadata ->> 'owner')::uuid
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat_files' AND
  auth.uid() = (storage.object_metadata ->> 'owner')::uuid
);
