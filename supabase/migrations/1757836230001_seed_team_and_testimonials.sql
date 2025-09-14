/*
          # [DATA] Seed Team & Testimonials Data
          This migration inserts sample data into the `team_members` and `testimonials` tables to populate the new pages.

          ## Query Description: This is a data-only migration.
          - It adds 4 sample team members.
          - It adds 3 sample testimonials.
          - This will make the Team and Testimonials pages functional and visually complete for demonstration.
          - No existing data is affected.

          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (by deleting the inserted rows)
          
          ## Structure Details:
          - Tables Affected: `public.team_members`, `public.testimonials`
          
          ## Security Implications:
          - RLS Status: Not applicable (Data insertion).
          - Policy Changes: No.
          - Auth Requirements: Requires admin/postgres role to run.
          
          ## Performance Impact:
          - Indexes: None.
          - Triggers: None.
          - Estimated Impact: Negligible.
          */

-- Seed Team Members
INSERT INTO public.team_members (full_name, role, department, bio, avatar_url, linkedin_url)
VALUES
(
  'Dr. Aline Kono',
  'Médecin en Chef & Pédiatre',
  'Médical',
  'Avec plus de 15 ans d''expérience en pédiatrie dans les hôpitaux de Yaoundé, Dr. Kono supervise la validation médicale de notre IA et dirige notre équipe de médecins partenaires.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
  'https://linkedin.com'
),
(
  'Samuel Biyong',
  'Ingénieur IA & Développeur Principal',
  'Technique',
  'Diplômé de l''École Polytechnique, Samuel est l''architecte de notre modèle de prédiction. Il est passionné par l''application de l''IA pour résoudre des problèmes concrets en Afrique.',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
  'https://linkedin.com'
),
(
  'Christelle Mbia',
  'Directrice des Opérations',
  'Opérations',
  'Christelle assure le bon fonctionnement de toutes nos opérations sur le terrain et gère les partenariats stratégiques avec les institutions de santé au Cameroun.',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3',
  'https://linkedin.com'
),
(
  'Jean-Pierre Talla',
  'CEO & Fondateur',
  'Direction',
  'Ancien ingénieur de la diaspora, Jean-Pierre est revenu au Cameroun avec la vision d''utiliser la technologie pour améliorer l''accès aux soins de santé pour les enfants.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3',
  'https://linkedin.com'
);

-- Seed Testimonials
INSERT INTO public.testimonials (full_name, location, content, rating, status)
VALUES
(
  'Marie N.',
  'Yaoundé',
  'Un service absolument révolutionnaire pour le Cameroun. L''IA a correctement identifié les symptômes du paludisme chez ma fille, et la consultation vidéo avec le médecin a été rapide et professionnelle. Je recommande à tous les parents.',
  5,
  'approved'
),
(
  'Paul D.',
  'Douala',
  'En tant que père souvent en déplacement, EpicTrack est une tranquillité d''esprit. J''ai pu lancer une analyse pour mon fils à distance et obtenir un avis fiable. C''est l''avenir de la médecine ici.',
  5,
  'approved'
),
(
  'Fatima A.',
  'Garoua',
  'L''accès à un pédiatre est compliqué dans notre région. Grâce à EpicTrack, j''ai pu avoir une consultation de qualité pour mon bébé sans avoir à voyager des heures. Merci à toute l''équipe pour cette initiative.',
  5,
  'approved'
);
