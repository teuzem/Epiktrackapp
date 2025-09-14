/*
          # [Correctif] Politiques de Sécurité pour le Stockage de la Messagerie
          [Ce script corrige une erreur de syntaxe dans la migration précédente et renforce les politiques de sécurité pour le bucket 'chat_files'.]

          ## Query Description: [Ce script crée le bucket 'chat_files' s'il n'existe pas et applique des politiques de sécurité (RLS) corrigées et plus robustes. Il garantit que seuls les utilisateurs authentifiés impliqués dans une conversation peuvent voir les fichiers échangés, et que seul l'expéditeur peut insérer, modifier ou supprimer un fichier qu'il a envoyé. Cette opération est sûre et n'affecte pas les données existantes.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Bucket: storage.chat_files
          - Policies: RLS pour SELECT, INSERT, UPDATE, DELETE sur storage.objects pour le bucket 'chat_files'.
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [Utilisateur authentifié]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Négligeable. Les requêtes sur les politiques sont efficaces.]
          */

-- 1. Créer le bucket de stockage pour les fichiers de chat, s'il n'existe pas.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_files', 'chat_files', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques de sécurité pour le bucket 'chat_files'.
-- NOTE: Nous supprimons les anciennes politiques potentiellement défectueuses avant de créer les nouvelles.

DROP POLICY IF EXISTS "Allow authenticated users to read chat files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner to update their chat files" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner to delete their chat files" ON storage.objects;

-- POLITIQUE DE LECTURE (SELECT)
-- Autorise un utilisateur à lire un fichier s'il est l'expéditeur ou le destinataire du message contenant ce fichier.
CREATE POLICY "Allow authenticated users to read chat files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'chat_files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1
        FROM public.messages
        WHERE messages.file_url LIKE '%' || storage.objects.name
        AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
);

-- POLITIQUE D'ÉCRITURE (INSERT)
-- Autorise un utilisateur à insérer un fichier si son ID correspond à la métadonnée 'owner' qu'il fournit.
CREATE POLICY "Allow authenticated users to insert their own chat files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'chat_files' AND
    auth.role() = 'authenticated' AND
    (storage.object_metadata ->> 'owner')::uuid = auth.uid()
);

-- POLITIQUE DE MISE À JOUR (UPDATE)
-- Autorise un utilisateur à mettre à jour un fichier s'il en est le propriétaire (via métadonnée).
CREATE POLICY "Allow owner to update their chat files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'chat_files' AND
    auth.role() = 'authenticated' AND
    (storage.object_metadata ->> 'owner')::uuid = auth.uid()
);

-- POLITIQUE DE SUPPRESSION (DELETE)
-- Autorise un utilisateur à supprimer un fichier s'il en est le propriétaire (via métadonnée).
CREATE POLICY "Allow owner to delete their chat files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'chat_files' AND
    auth.role() = 'authenticated' AND
    (storage.object_metadata ->> 'owner'):_uuid = auth.uid()
);
