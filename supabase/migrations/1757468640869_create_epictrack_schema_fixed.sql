/*
# Migration EpicTrack - Schéma de Base de Données Corrigé
Création complète de la structure de base de données pour l'application EpicTrack
de prédiction d'épidémies infantiles au Cameroun.

## Query Description: 
Cette migration crée l'infrastructure complète de la base de données EpicTrack incluant
les tables pour les profils utilisateurs, enfants, maladies, prédictions IA, rendez-vous,
paiements, messages et analytics. Aucune donnée existante n'est affectée car c'est une
création initiale. Cette opération est sécurisée et réversible.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables: profiles, children, diseases, predictions, appointments, payments, messages, doctor_profiles, analytics_data
- Contraintes: Foreign keys, unique constraints, check constraints
- Index: Performance indexes pour les requêtes fréquentes
- RLS: Row Level Security activé sur toutes les tables publiques

## Security Implications:
- RLS Status: Enabled sur toutes les tables publiques
- Policy Changes: Oui - Policies de base créées
- Auth Requirements: Integration avec auth.users

## Performance Impact:
- Indexes: Ajoutés sur les clés étrangères et colonnes de recherche
- Triggers: Trigger automatique pour création de profil
- Estimated Impact: Minimal - Structure de base
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('parent', 'doctor', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE disease_severity AS ENUM ('mild', 'moderate', 'severe', 'critical');
CREATE TYPE prediction_status AS ENUM ('pending', 'completed', 'confirmed', 'disputed');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE consultation_type AS ENUM ('video', 'chat', 'phone');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'sticker', 'gif');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'parent',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    location TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Children table
CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    vaccination_status JSONB DEFAULT '{}',
    weight_history JSONB DEFAULT '[]',
    height_history JSONB DEFAULT '[]',
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diseases table (20+ maladies infantiles courantes au Cameroun)
CREATE TABLE public.diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    category TEXT NOT NULL,
    common_symptoms TEXT[] NOT NULL,
    causes TEXT[] NOT NULL,
    prevention_methods TEXT[] NOT NULL,
    minsante_approved_treatment TEXT NOT NULL,
    natural_treatment TEXT,
    severity_level disease_severity NOT NULL,
    age_group TEXT[] NOT NULL,
    prevalence_in_cameroon DECIMAL(5,2),
    is_epidemic_risk BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Doctor profiles table
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    specialization TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    hospital_affiliation TEXT,
    consultation_fee DECIMAL(10,2) DEFAULT 3500,
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['français'],
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_consultations INTEGER DEFAULT 0,
    verified_by_minsante BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Predictions table
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    symptoms JSONB NOT NULL,
    additional_info JSONB DEFAULT '{}',
    predicted_disease_id UUID REFERENCES public.diseases(id),
    confidence_score DECIMAL(5,2),
    ml_model_version TEXT,
    status prediction_status DEFAULT 'pending',
    report_generated_at TIMESTAMPTZ,
    report_downloaded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES public.predictions(id),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_type consultation_type DEFAULT 'video',
    status appointment_status DEFAULT 'pending',
    fee_amount DECIMAL(10,2) DEFAULT 3500,
    meeting_link TEXT,
    meeting_id TEXT,
    notes TEXT,
    prescription JSONB DEFAULT '{}',
    diagnosis_confirmed BOOLEAN,
    ai_diagnosis_accuracy TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'XAF',
    payment_method TEXT NOT NULL,
    payment_provider TEXT NOT NULL,
    transaction_id TEXT,
    reference TEXT NOT NULL UNIQUE,
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    message_type message_type DEFAULT 'text',
    file_url TEXT,
    sticker_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics data table
CREATE TABLE public.analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert maladies infantiles courantes au Cameroun
INSERT INTO public.diseases (name, name_fr, category, common_symptoms, causes, prevention_methods, minsante_approved_treatment, natural_treatment, severity_level, age_group, prevalence_in_cameroon, is_epidemic_risk) VALUES
('Malaria', 'Paludisme', 'Parasitic', 
 ARRAY['Fever', 'Chills', 'Vomiting', 'Headache', 'Fatigue'], 
 ARRAY['Plasmodium parasite', 'Mosquito bites', 'Poor sanitation'], 
 ARRAY['Moustiquaires imprégnées', 'Elimination des eaux stagnantes', 'Chimioprophylaxie'],
 'Artéméther-Luméfantrine selon protocole MINSANTE. Paracétamol pour la fièvre. Hospitalisation si signes de gravité.',
 'Tisane de feuilles de papayer, quinquina. Repos complet et hydratation.',
 'severe', ARRAY['0-5 ans', '6-12 ans'], 85.5, true),

('Acute Respiratory Infection', 'Infection Respiratoire Aiguë', 'Respiratory',
 ARRAY['Cough', 'Fever', 'Difficulty breathing', 'Chest pain', 'Rapid breathing'],
 ARRAY['Viral infection', 'Bacterial infection', 'Air pollution', 'Malnutrition'],
 ARRAY['Vaccination', 'Hygiène des mains', 'Éviter la fumée', 'Allaitement maternel'],
 'Amoxicilline 50mg/kg/jour en 3 prises. Paracétamol. Oxygénothérapie si détresse respiratoire.',
 'Inhalation de vapeur d eucalyptus, miel et citron, tisane de gingembre.',
 'moderate', ARRAY['0-5 ans'], 78.2, true),

('Diarrheal Disease', 'Maladie Diarrhéique', 'Gastrointestinal',
 ARRAY['Diarrhea', 'Vomiting', 'Dehydration', 'Abdominal pain', 'Fever'],
 ARRAY['Contaminated water', 'Poor hygiene', 'Viral infection', 'Bacterial infection'],
 ARRAY['Hygiène de l eau', 'Assainissement', 'Vaccination rotavirus'],
 'Sels de Réhydratation Orale (SRO). Zinc 20mg/jour pendant 10 jours. Continuer l allaitement.',
 'Eau de riz, tisane de feuilles de goyavier, charbon végétal.',
 'moderate', ARRAY['0-2 ans', '2-5 ans'], 72.8, true),

('Measles', 'Rougeole', 'Viral',
 ARRAY['Fever', 'Cough', 'Runny nose', 'Red eyes', 'Skin rash'],
 ARRAY['Measles virus', 'Droplet transmission', 'Poor vaccination coverage'],
 ARRAY['Vaccination ROR', 'Isolement des cas', 'Améliorer la couverture vaccinale'],
 'Vitamine A 200000 UI. Paracétamol. Traitement symptomatique. Surveillance des complications.',
 'Tisane de feuilles de margousier, bains tièdes, repos complet.',
 'severe', ARRAY['6 mois-5 ans'], 15.3, true),

('Meningitis', 'Méningite', 'Neurological',
 ARRAY['High fever', 'Severe headache', 'Neck stiffness', 'Vomiting', 'Confusion'],
 ARRAY['Bacterial infection', 'Viral infection', 'Overcrowding', 'Poor ventilation'],
 ARRAY['Vaccination', 'Éviter la surpopulation', 'Hygiène respiratoire'],
 'Ceftriaxone 100mg/kg/jour IV. Dexaméthasone. Réanimation si nécessaire.',
 'Non recommandé - Urgence médicale absolue',
 'critical', ARRAY['1-15 ans'], 8.7, true),

('Pneumonia', 'Pneumonie', 'Respiratory',
 ARRAY['High fever', 'Cough with sputum', 'Chest pain', 'Difficulty breathing', 'Fatigue'],
 ARRAY['Bacterial infection', 'Viral infection', 'Malnutrition', 'HIV infection'],
 ARRAY['Vaccination pneumocoque', 'Allaitement maternel', 'Éviter la fumée'],
 'Amoxicilline 90mg/kg/jour ou Ceftriaxone si sévère. Oxygène si hypoxie.',
 'Inhalation d eucalyptus, tisane de thym, repos strict.',
 'severe', ARRAY['0-5 ans'], 25.4, true),

('Typhoid Fever', 'Fièvre Typhoïde', 'Bacterial',
 ARRAY['Prolonged fever', 'Headache', 'Abdominal pain', 'Rose spots', 'Diarrhea or constipation'],
 ARRAY['Salmonella typhi', 'Contaminated food', 'Poor sanitation', 'Contaminated water'],
 ARRAY['Hygiène alimentaire', 'Eau potable', 'Vaccination', 'Assainissement'],
 'Ciprofloxacine 15mg/kg/jour ou Azithromycine. Paracétamol pour la fièvre.',
 'Tisane de feuilles de citronnier, repos, régime léger.',
 'severe', ARRAY['5-15 ans'], 12.1, false),

('Whooping Cough', 'Coqueluche', 'Bacterial',
 ARRAY['Severe cough', 'Whooping sound', 'Vomiting after cough', 'Runny nose', 'Low fever'],
 ARRAY['Bordetella pertussis', 'Droplet transmission', 'Poor vaccination coverage'],
 ARRAY['Vaccination DTC', 'Isolement des cas', 'Hygiène respiratoire'],
 'Azithromycine 10mg/kg/jour pendant 5 jours. Soins de support.',
 'Miel (>1 an), tisane de thym, humidification de l air.',
 'moderate', ARRAY['0-1 an'], 6.8, true),

('Chickenpox', 'Varicelle', 'Viral',
 ARRAY['Itchy rash', 'Fever', 'Headache', 'Fatigue', 'Loss of appetite'],
 ARRAY['Varicella-zoster virus', 'Direct contact', 'Droplet transmission'],
 ARRAY['Vaccination', 'Isolement des cas', 'Hygiène des mains'],
 'Paracétamol. Antihistaminiques si prurit intense. Éviter l aspirine.',
 'Bains à l avoine, lotion calamine naturelle, tisane de camomille.',
 'mild', ARRAY['2-10 ans'], 18.9, false),

('Hepatitis A', 'Hépatite A', 'Viral',
 ARRAY['Jaundice', 'Fatigue', 'Nausea', 'Abdominal pain', 'Dark urine'],
 ARRAY['Hepatitis A virus', 'Contaminated food', 'Poor hygiene', 'Contaminated water'],
 ARRAY['Vaccination', 'Hygiène alimentaire', 'Eau potable', 'Hygiène des mains'],
 'Traitement symptomatique. Repos. Éviter l alcool et paracétamol.',
 'Tisane de chardon-marie, repos complet, régime sans graisse.',
 'moderate', ARRAY['2-15 ans'], 22.3, false),

('Scabies', 'Gale', 'Parasitic',
 ARRAY['Intense itching', 'Skin rash', 'Burrows', 'Secondary infection'],
 ARRAY['Sarcoptes scabiei', 'Direct contact', 'Shared clothing', 'Overcrowding'],
 ARRAY['Hygiène corporelle', 'Lavage des vêtements', 'Éviter le contact'],
 'Perméthrine 5% en application locale. Traitement de tous les contacts.',
 'Huile de neem, soufre en pommade, bains au sel.',
 'mild', ARRAY['All ages'], 31.7, false),

('Otitis Media', 'Otite Moyenne', 'Bacterial',
 ARRAY['Ear pain', 'Fever', 'Hearing loss', 'Ear discharge', 'Irritability'],
 ARRAY['Bacterial infection', 'Viral infection', 'Poor hygiene', 'Malnutrition'],
 ARRAY['Allaitement maternel', 'Éviter la fumée', 'Vaccination pneumocoque'],
 'Amoxicilline 50mg/kg/jour. Paracétamol pour la douleur.',
 'Compresses chaudes, huile d olive tiède, tisane d ail.',
 'moderate', ARRAY['0-5 ans'], 45.2, false),

('Conjunctivitis', 'Conjonctivite', 'Bacterial/Viral',
 ARRAY['Red eyes', 'Eye discharge', 'Itching', 'Tearing', 'Light sensitivity'],
 ARRAY['Bacterial infection', 'Viral infection', 'Allergies', 'Poor hygiene'],
 ARRAY['Hygiène des mains', 'Éviter le contact', 'Eau propre'],
 'Collyre antibiotique si bactérien. Lavage au sérum physiologique.',
 'Compresses de thé vert, eau de rose, lavage à l eau bouillie.',
 'mild', ARRAY['All ages'], 38.6, false),

('Tonsillitis', 'Amygdalite', 'Bacterial/Viral',
 ARRAY['Sore throat', 'Fever', 'Swollen tonsils', 'Difficulty swallowing', 'Bad breath'],
 ARRAY['Streptococcus', 'Viral infection', 'Poor hygiene', 'Overcrowding'],
 ARRAY['Hygiène bucco-dentaire', 'Éviter le contact', 'Renforcer l immunité'],
 'Amoxicilline si streptocoque. Paracétamol. Gargarismes antiseptiques.',
 'Gargarismes au miel et citron, tisane de gingembre.',
 'moderate', ARRAY['3-12 ans'], 42.1, false),

('Gastroenteritis', 'Gastro-entérite', 'Viral/Bacterial',
 ARRAY['Diarrhea', 'Vomiting', 'Fever', 'Abdominal cramps', 'Dehydration'],
 ARRAY['Rotavirus', 'Norovirus', 'Bacterial infection', 'Contaminated food'],
 ARRAY['Hygiène alimentaire', 'Vaccination rotavirus', 'Eau potable'],
 'SRO. Probiotiques. Régime adapté. Zinc si persistant.',
 'Eau de riz, tisane de menthe, charbon végétal.',
 'moderate', ARRAY['0-5 ans'], 68.9, false),

('Anemia', 'Anémie', 'Nutritional',
 ARRAY['Pale skin', 'Fatigue', 'Weakness', 'Rapid heartbeat', 'Cold hands'],
 ARRAY['Iron deficiency', 'Malnutrition', 'Chronic disease', 'Parasites'],
 ARRAY['Alimentation riche en fer', 'Déparasitage', 'Supplémentation'],
 'Sulfate de fer 3-6mg/kg/jour. Acide folique. Traitement de la cause.',
 'Alimentation riche en fer, spiruline, feuilles vertes.',
 'moderate', ARRAY['6 mois-5 ans'], 56.3, false),

('Kwashiorkor', 'Kwashiorkor', 'Nutritional',
 ARRAY['Edema', 'Hair changes', 'Skin lesions', 'Growth retardation', 'Apathy'],
 ARRAY['Protein deficiency', 'Malnutrition', 'Poverty', 'Food insecurity'],
 ARRAY['Alimentation équilibrée', 'Sécurité alimentaire', 'Éducation nutritionnelle'],
 'Réhabilitation nutritionnelle progressive. F75 puis F100. Antibiotiques.',
 'Lait maternel prolongé, bouillies enrichies, légumineuses.',
 'severe', ARRAY['1-3 ans'], 8.4, false),

('Marasmus', 'Marasme', 'Nutritional',
 ARRAY['Severe weight loss', 'Muscle wasting', 'Wrinkled skin', 'Irritability'],
 ARRAY['Caloric deficiency', 'Chronic malnutrition', 'Poverty', 'Disease'],
 ARRAY['Sécurité alimentaire', 'Allaitement maternel', 'Soins de santé'],
 'Réhabilitation nutritionnelle. F75 puis F100. Soins médicaux.',
 'Allaitement maternel, bouillies nutritives, huiles végétales.',
 'critical', ARRAY['0-2 ans'], 12.7, false),

('Tuberculosis', 'Tuberculose', 'Bacterial',
 ARRAY['Persistent cough', 'Weight loss', 'Night sweats', 'Fever', 'Fatigue'],
 ARRAY['Mycobacterium tuberculosis', 'Poor living conditions', 'Malnutrition', 'HIV'],
 ARRAY['Vaccination BCG', 'Améliorer les conditions de vie', 'Dépistage'],
 'Traitement antituberculeux selon protocole MINSANTE. RHZE pendant 2 mois puis RH.',
 'Repos complet, alimentation riche, tisane de plantain.',
 'severe', ARRAY['All ages'], 4.2, true),

('Sickle Cell Disease', 'Drépanocytose', 'Genetic',
 ARRAY['Pain crisis', 'Anemia', 'Swelling', 'Infections', 'Delayed growth'],
 ARRAY['Genetic mutation', 'Hereditary condition', 'Stress factors', 'Dehydration'],
 ARRAY['Conseil génétique', 'Hydratation', 'Éviter les facteurs déclenchants'],
 'Hydroxyurée. Acide folique. Antalgiques. Transfusion si nécessaire.',
 'Hydratation abondante, éviter le froid, repos.',
 'severe', ARRAY['0-adult'], 2.1, false);

-- Create indexes for better performance
CREATE INDEX idx_children_parent_id ON public.children(parent_id);
CREATE INDEX idx_predictions_child_id ON public.predictions(child_id);
CREATE INDEX idx_predictions_disease_id ON public.predictions(predicted_disease_id);
CREATE INDEX idx_appointments_parent_id ON public.appointments(parent_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_messages_appointment_id ON public.messages(appointment_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children" ON public.children
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own children" ON public.children
    FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children" ON public.children
    FOR UPDATE USING (parent_id = auth.uid());

-- RLS Policies for diseases (public read)
CREATE POLICY "Anyone can view diseases" ON public.diseases
    FOR SELECT USING (true);

-- RLS Policies for predictions
CREATE POLICY "Parents can view predictions for their children" ON public.predictions
    FOR SELECT USING (
        child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    );

CREATE POLICY "Parents can insert predictions for their children" ON public.predictions
    FOR INSERT WITH CHECK (
        child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    );

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments" ON public.appointments
    FOR SELECT USING (parent_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Parents can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Doctors can update their appointments" ON public.appointments
    FOR UPDATE USING (doctor_id = auth.uid());

-- RLS Policies for payments
CREATE POLICY "Parents can view their payments" ON public.payments
    FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can create payments" ON public.payments
    FOR INSERT WITH CHECK (parent_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- RLS Policies for doctor profiles
CREATE POLICY "Anyone can view doctor profiles" ON public.doctor_profiles
    FOR SELECT USING (true);

CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "Users can view own analytics" ON public.analytics_data
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics" ON public.analytics_data
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nouveau'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
