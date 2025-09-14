/*
          # [Seed Data]
          Populate the team_members and testimonials tables with sample data.

          ## Query Description: "This operation inserts sample data into the 'team_members' and 'testimonials' tables. It is safe to run and will not affect any existing user data. It is intended to provide initial content for the new pages."
          
          ## Metadata:
          - Schema-Category: ["Data"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Tables affected: team_members, testimonials
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [None for this script]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low]
          */

-- Seed Team Members
INSERT INTO public.team_members (full_name, role, department, bio, avatar_url, linkedin_url, twitter_url, status)
VALUES
('Dr. Marie-Claire Mballa', 'Directrice Médicale & Co-fondatrice', 'Direction', 'Pédiatre passionnée avec plus de 15 ans d''expérience dans les hôpitaux camerounais. Sa vision est de rendre les soins de santé accessibles à chaque enfant.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3', 'https://linkedin.com', 'https://twitter.com', 'active'),
('Jean-Pierre Fotso', 'Directeur Technique & Co-fondateur', 'Direction', 'Ingénieur logiciel spécialisé en intelligence artificielle. Il dirige le développement de notre technologie de prédiction pour assurer sa précision et sa fiabilité.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3', 'https://linkedin.com', 'https://twitter.com', 'active'),
('Aïcha Njoya', 'Développeuse Frontend Senior', 'Technique', 'Experte en interfaces utilisateur, Aïcha transforme des idées complexes en une application simple et agréable à utiliser pour les parents et les médecins.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1771&auto=format&fit=crop&ixlib=rb-4.0.3', 'https://linkedin.com', NULL, 'active'),
('Dr. Samuel Eko', 'Médecin Partenaire Principal', 'Médical', 'Spécialiste des maladies infectieuses pédiatriques, Dr. Eko collabore étroitement avec notre équipe technique pour affiner les algorithmes de l''IA.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3', 'https://linkedin.com', NULL, 'active'),
('Fatima Bello', 'Responsable des Opérations', 'Opérations', 'Fatima assure le bon fonctionnement de la plateforme et coordonne le réseau de nos médecins partenaires à travers le Cameroun.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3', 'https://linkedin.com', 'https://twitter.com', 'active');

-- Seed Testimonials
INSERT INTO public.testimonials (full_name, location, content, rating, status)
VALUES
('Nathalie T.', 'Yaoundé', 'EpicTrack a rapidement identifié que ma fille avait le paludisme. La consultation vidéo avec le Dr. Mballa a été excellente et rassurante. Un service essentiel !', 5, 'approved'),
('Paul B.', 'Douala', 'En tant que père de 3 enfants, EpicTrack me donne une vraie tranquillité d''esprit. Les prédictions sont très précises et l''application est facile à utiliser.', 5, 'approved'),
('Amina I.', 'Garoua', 'L''application a détecté une pneumonie chez mon fils. Grâce au traitement rapide suggéré et confirmé par le médecin, il va beaucoup mieux maintenant. Je recommande à tous les parents.', 5, 'approved'),
('Christian M.', 'Bafoussam', 'Un outil incroyable pour les zones où l''accès à un pédiatre est difficile. Le rapport de prédiction est très complet et aide à mieux comprendre la situation.', 4, 'approved');
