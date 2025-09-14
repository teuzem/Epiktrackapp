/*
# Seed Team Members and Testimonials
[Populates the team_members and testimonials tables with sample data to demonstrate functionality.]

## Query Description: [This script inserts sample data into the 'team_members' and 'testimonials' tables. This is a non-destructive operation and only adds new rows. It is safe to run on a development environment.]

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Tables affected:
  - public.team_members (INSERT)
  - public.testimonials (INSERT)

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [service_role key required to run]

## Performance Impact:
- Indexes: [No change]
- Triggers: [No change]
- Estimated Impact: [Negligible. Inserts a small number of rows.]
*/

-- Seed Team Members
INSERT INTO public.team_members (full_name, role, department, bio, avatar_url, linkedin_url, twitter_url, status)
VALUES
  ('Dr. Charles Ekwensi', 'Fondateur & CEO', 'Direction', 'Ancien médecin pédiatre avec plus de 15 ans d''expérience, Charles est passionné par l''intersection de la santé et de la technologie pour résoudre les défis de santé publique au Cameroun.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=512&q=80', 'https://linkedin.com', 'https://twitter.com', 'active'),
  ('Aïcha Benali', 'Directrice Technique (CTO)', 'Technique', 'Ingénieure en intelligence artificielle diplômée de l''EPFL, Aïcha dirige le développement de notre modèle de prédiction et de l''infrastructure technique de la plateforme.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=512&q=80', 'https://linkedin.com', 'https://twitter.com', 'active'),
  ('Dr. Marie-Claire Mballa', 'Médecin en Chef', 'Médical', 'Spécialiste en maladies infectieuses pédiatriques, Dr. Mballa supervise la validation médicale de notre IA et dirige notre réseau de médecins partenaires.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=512&q=80', 'https://linkedin.com', NULL, 'active'),
  ('Jean-Pierre Kouam', 'Responsable des Opérations', 'Opérations', 'Avec une solide expérience en gestion de projets dans le secteur de la santé, Jean-Pierre assure le bon déploiement de nos services sur le terrain et la satisfaction de nos utilisateurs.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=512&q=80', 'https://linkedin.com', 'https://twitter.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Testimonials
INSERT INTO public.testimonials (full_name, location, content, rating, status)
VALUES
  ('Marie Nguema', 'Yaoundé', 'EpicTrack a rapidement identifié que ma fille avait le paludisme. La consultation vidéo avec le Dr. Mballa a été excellente et rassurante. Un service indispensable !', 5, 'approved'),
  ('Jean-Paul Ondoa', 'Douala', 'En tant que père de 3 enfants, EpicTrack me donne une vraie tranquillité d''esprit. Les prédictions sont très précises et l''accès aux médecins est simplifié.', 5, 'approved'),
  ('Fatima Adamou', 'Garoua', 'L''application a détecté une pneumonie chez mon fils. Grâce au traitement rapide recommandé par le médecin via l''app, il va beaucoup mieux maintenant. Merci EpicTrack.', 5, 'approved'),
  ('Sylvie Kamga', 'Bafoussam', 'Une application très bien pensée pour le contexte camerounais. Le suivi de la croissance de mon bébé est très pratique. Je recommande à tous les parents.', 4, 'approved')
ON CONFLICT (id) DO NOTHING;
