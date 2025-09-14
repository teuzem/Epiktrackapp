/*
  # [Operation] Create Storage Bucket for Children Photos
  [Description] This migration creates a dedicated, private storage bucket for children's photos.

  ## Query Description: [This operation sets up the storage infrastructure. Security policies (RLS) are intentionally omitted from this script due to platform permissions and must be applied manually via the Supabase Dashboard SQL Editor.]
  
  ## Metadata:
  - Schema-Category: ["Structural"]
  - Impact-Level: ["Low"]
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Creates bucket: 'children_photos'
  
  ## Security Implications:
  - RLS Status: [Enabled on Bucket]
  - Policy Changes: [No] - Policies must be added manually.
  - Auth Requirements: [Authenticated users]
  
  ## Performance Impact:
  - Indexes: [N/A]
  - Triggers: [N/A]
  - Estimated Impact: [None]
*/

-- Create a private bucket for children photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('children_photos', 'children_photos', false)
ON CONFLICT (id) DO NOTHING;
