/*
          # [Opération de Stockage et Sécurité]
          Création du bucket de stockage pour les photos des enfants et renforcement des politiques de sécurité.

          ## Description de la Requête:
          Cette opération configure le stockage de fichiers sur Supabase pour permettre aux parents de téléverser les photos de leurs enfants. Elle crée un "bucket" de stockage privé nommé `children_photos`. Des politiques de sécurité (RLS) sont ajoutées pour garantir que :
          1.  Les parents ne peuvent voir que les photos de leurs propres enfants.
          2.  Les parents ne peuvent téléverser des photos que pour leurs propres enfants.
          3.  Les parents peuvent mettre à jour ou supprimer uniquement les photos de leurs enfants.
          Cette migration est essentielle pour la confidentialité et la sécurité des données. Aucun risque de perte de données existantes.

          ## Métadonnées:
          - Catégorie de Schéma: "Structural"
          - Niveau d'Impact: "Low"
          - Sauvegarde Requise: false
          - Réversible: true

          ## Détails de la Structure:
          - Opération: Création d'un bucket de stockage (`storage.buckets`).
          - Nom du Bucket: `children_photos`.
          - Opération: Création de politiques RLS sur `storage.objects`.

          ## Implications de Sécurité:
          - Statut RLS: Activé sur le stockage.
          - Changements de Politique: Oui, ajout de politiques SELECT, INSERT, UPDATE, DELETE sur `storage.objects` pour le bucket `children_photos`.
          - Exigences d'Authentification: Un utilisateur doit être authentifié (rôle `authenticated`).

          ## Impact sur la Performance:
          - Index: Aucun changement.
          - Déclencheurs: Aucun changement.
          - Impact Estimé: Faible. Les requêtes de stockage seront légèrement plus lentes en raison des vérifications RLS, mais c'est un compromis nécessaire pour la sécurité.
          */

-- 1. Créer le bucket de stockage pour les photos des enfants
INSERT INTO storage.buckets (id, name, public)
VALUES ('children_photos', 'children_photos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. Activer RLS sur la table des objets de stockage (si ce n'est pas déjà fait)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques pour ce bucket pour éviter les conflits
DROP POLICY IF EXISTS "Parent can view own child photo" ON storage.objects;
DROP POLICY IF EXISTS "Parent can upload photo for own child" ON storage.objects;
DROP POLICY IF EXISTS "Parent can update photo of own child" ON storage.objects;
DROP POLICY IF EXISTS "Parent can delete photo of own child" ON storage.objects;

-- 4. Politique SELECT: Autoriser les parents à voir les photos de leurs propres enfants
CREATE POLICY "Parent can view own child photo"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'children_photos' AND
  owner = auth.uid() AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.children WHERE parent_id = auth.uid()
  )
);

-- 5. Politique INSERT: Autoriser les parents à téléverser une photo pour leurs enfants
CREATE POLICY "Parent can upload photo for own child"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'children_photos' AND
  owner = auth.uid() AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.children WHERE parent_id = auth.uid()
  )
);

-- 6. Politique UPDATE: Autoriser les parents à mettre à jour la photo de leurs enfants
CREATE POLICY "Parent can update photo of own child"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'children_photos' AND
  owner = auth.uid() AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.children WHERE parent_id = auth.uid()
  )
);

-- 7. Politique DELETE: Autoriser les parents à supprimer la photo de leurs enfants
CREATE POLICY "Parent can delete photo of own child"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'children_photos' AND
  owner = auth.uid() AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.children WHERE parent_id = auth.uid()
  )
);
