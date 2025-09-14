/*
# [Correctif Final] Politiques de Sécurité du Stockage de Chat
[Ce script corrige les erreurs de syntaxe précédentes et implémente une méthode de sécurité plus robuste, basée sur le chemin du fichier, pour le bucket 'chat_files'.]

## Query Description: [Ce script met à jour les politiques de sécurité pour le stockage des fichiers de chat. Il n'y a aucun risque de perte de données. Les politiques précédentes, si elles existent, seront supprimées et recréées correctement en utilisant une méthode plus fiable.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Affecte les politiques RLS sur la table `storage.objects`.

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [Yes]
- Auth Requirements: [authenticated]

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Négligeable. La correction assure le bon fonctionnement et la sécurité des téléversements de fichiers.]
*/

-- Drop existing policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Users can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;

-- RLS Policies for chat_files bucket using path-based security

-- 1. Allow users to upload files into their own folder (e.g., /user_id/file.png)
CREATE POLICY "Users can upload chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'chat_files' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 2. Allow users to view files they sent or that were sent to them
CREATE POLICY "Users can view their chat files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    (
        -- User is the sender (file is in their folder)
        (string_to_array(name, '/'))[1] = auth.uid()::text
        OR
        -- User is the receiver of the message containing the file
        auth.uid() IN (
            SELECT receiver_id FROM public.messages WHERE file_url LIKE '%' || storage.objects.name
        )
    )
);

-- 3. Allow users to update their own files
CREATE POLICY "Users can update their own chat files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat_files' AND
    (string_to_array(name, '/'))[1] = auth.uid()::text
);
