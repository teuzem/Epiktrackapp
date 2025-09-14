/*
# EpicTrack Database Schema Migration
Complete database structure for pediatric epidemic prediction system in Cameroon

## Query Description:
This migration creates the foundational database structure for EpicTrack, a pediatric health prediction system.
It establishes user profiles, medical data management, appointment scheduling, payment tracking, and communication systems.
This is a structural migration that builds the core tables and relationships needed for the application.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: true

## Structure Details:
- User profiles (parents and doctors)
- Child profiles and medical history
- Disease prediction system
- Appointment and consultation management
- Payment and transaction tracking
- Messaging and communication
- Analytics and reporting

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes - comprehensive RLS policies
- Auth Requirements: All tables reference auth.users

## Performance Impact:
- Indexes: Added on frequently queried columns
- Triggers: Profile creation trigger
- Estimated Impact: Initial setup with optimized structure
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('parent', 'doctor', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE consultation_type AS ENUM ('video', 'chat', 'phone');
CREATE TYPE child_gender AS ENUM ('male', 'female');
CREATE TYPE prediction_status AS ENUM ('pending', 'completed', 'confirmed', 'disputed');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'parent',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    location TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor profiles additional information
CREATE TABLE public.doctor_profiles (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    license_number TEXT UNIQUE NOT NULL,
    specialization TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0,
    hospital_affiliation TEXT,
    consultation_fee INTEGER DEFAULT 3500, -- in FCFA
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['French', 'English'],
    is_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_consultations INTEGER DEFAULT 0,
    verified_by_minsante BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children profiles
CREATE TABLE public.children (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender child_gender NOT NULL,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    vaccination_status JSONB DEFAULT '{}',
    weight_history JSONB DEFAULT '[]',
    height_history JSONB DEFAULT '[]',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diseases database (20+ common childhood diseases in Cameroon)
CREATE TABLE public.diseases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_fr TEXT NOT NULL, -- French translation
    category TEXT NOT NULL,
    common_symptoms TEXT[] NOT NULL,
    causes TEXT[],
    prevention_methods TEXT[],
    minsante_approved_treatment TEXT,
    natural_treatment TEXT,
    severity_level TEXT CHECK (severity_level IN ('mild', 'moderate', 'severe', 'critical')),
    age_group TEXT[], -- e.g., ['0-1', '1-5', '5-10', '10-15']
    prevalence_in_cameroon DECIMAL(5,2), -- percentage
    is_epidemic_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom checker and predictions
CREATE TABLE public.predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    symptoms JSONB NOT NULL, -- structured symptom data
    additional_info JSONB DEFAULT '{}', -- medical history, current conditions
    predicted_disease_id UUID REFERENCES public.diseases(id),
    confidence_score DECIMAL(5,2),
    ml_model_version TEXT,
    status prediction_status DEFAULT 'pending',
    report_generated_at TIMESTAMP WITH TIME ZONE,
    report_downloaded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical consultations and appointments
CREATE TABLE public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    consultation_type consultation_type DEFAULT 'video',
    status appointment_status DEFAULT 'pending',
    fee_amount INTEGER DEFAULT 3500, -- in FCFA
    meeting_link TEXT,
    meeting_id TEXT,
    notes TEXT,
    prescription JSONB DEFAULT '{}',
    diagnosis_confirmed BOOLEAN,
    ai_diagnosis_accuracy TEXT, -- doctor's assessment of AI prediction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Payment transactions
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- in FCFA
    currency TEXT DEFAULT 'XAF',
    payment_method TEXT NOT NULL, -- paystack, cinetpay
    payment_provider TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    reference TEXT UNIQUE NOT NULL,
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages between parents and doctors
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- text, image, file, sticker, gif
    file_url TEXT,
    sticker_url TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File attachments for messages
CREATE TABLE public.message_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor availability schedule
CREATE TABLE public.doctor_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and reporting
CREATE TABLE public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_children_parent_id ON public.children(parent_id);
CREATE INDEX idx_predictions_child_id ON public.predictions(child_id);
CREATE INDEX idx_predictions_status ON public.predictions(status);
CREATE INDEX idx_appointments_parent_id ON public.appointments(parent_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_messages_appointment_id ON public.messages(appointment_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_doctor_availability_doctor_id ON public.doctor_availability(doctor_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view doctor profiles for appointments" ON public.profiles
    FOR SELECT USING (role = 'doctor');

-- Doctor profiles policies
CREATE POLICY "Doctors can manage their own profile" ON public.doctor_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Anyone can view doctor profiles" ON public.doctor_profiles
    FOR SELECT USING (true);

-- Children policies
CREATE POLICY "Parents can manage their children" ON public.children
    FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Doctors can view children during appointments" ON public.children
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE child_id = children.id 
            AND doctor_id = auth.uid()
        )
    );

-- Diseases policies (public read)
CREATE POLICY "Anyone can view diseases" ON public.diseases
    FOR SELECT USING (true);

-- Predictions policies
CREATE POLICY "Parents can manage their children's predictions" ON public.predictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.children 
            WHERE id = predictions.child_id 
            AND parent_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view predictions for their appointments" ON public.predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE prediction_id = predictions.id 
            AND doctor_id = auth.uid()
        )
    );

-- Appointments policies
CREATE POLICY "Parents can manage their appointments" ON public.appointments
    FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Doctors can manage their appointments" ON public.appointments
    FOR ALL USING (auth.uid() = doctor_id);

-- Payments policies
CREATE POLICY "Parents can view their payments" ON public.payments
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "System can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.payments
    FOR UPDATE USING (true);

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Message attachments policies
CREATE POLICY "Users can view attachments in their messages" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages 
            WHERE id = message_attachments.message_id 
            AND (sender_id = auth.uid() OR receiver_id = auth.uid())
        )
    );

-- Doctor availability policies
CREATE POLICY "Doctors can manage their availability" ON public.doctor_availability
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Anyone can view doctor availability" ON public.doctor_availability
    FOR SELECT USING (true);

-- Analytics policies
CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'parent')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample diseases data (20+ common childhood diseases in Cameroon)
INSERT INTO public.diseases (name, name_fr, category, common_symptoms, causes, prevention_methods, minsante_approved_treatment, natural_treatment, severity_level, age_group, prevalence_in_cameroon, is_epidemic_risk) VALUES
('Malaria', 'Paludisme', 'Parasitic', 
 ARRAY['Fièvre', 'Frissons', 'Maux de tête', 'Vomissements', 'Fatigue'], 
 ARRAY['Piqûres de moustiques infectés', 'Transmission par Plasmodium'],
 ARRAY['Moustiquaires imprégnées', 'Élimination des eaux stagnantes', 'Répulsifs'],
 'Artéméther-Luméfantrine, Quinine selon protocole MINSANTE',
 'Tisane de quinquina, feuilles de papayer (en complément uniquement)',
 'severe', ARRAY['0-1', '1-5', '5-10', '10-15'], 45.20, true),

('Pneumonia', 'Pneumonie', 'Respiratory', 
 ARRAY['Toux', 'Fièvre', 'Difficulté respiratoire', 'Douleur thoracique'],
 ARRAY['Infections bactériennes', 'Infections virales', 'Malnutrition'],
 ARRAY['Vaccination', 'Allaitement maternel', 'Hygiène des mains'],
 'Amoxicilline ou Ampicilline selon protocole MINSANTE',
 'Inhalations vapeur, miel (>1 an), hydratation',
 'severe', ARRAY['0-1', '1-5', '5-10'], 28.50, true),

('Diarrhea', 'Diarrhée', 'Gastrointestinal', 
 ARRAY['Selles liquides', 'Déshydratation', 'Vomissements', 'Fièvre'],
 ARRAY['Eau contaminée', 'Mauvaise hygiène', 'Infections'],
 ARRAY['Eau potable', 'Lavage des mains', 'Assainissement'],
 'SRO (Sels de Réhydratation Orale), Zinc selon MINSANTE',
 'Eau de riz, tisane de goyave, probiotiques naturels',
 'moderate', ARRAY['0-1', '1-5', '5-10'], 35.80, true),

('Measles', 'Rougeole', 'Viral', 
 ARRAY['Éruption cutanée', 'Fièvre', 'Toux', 'Écoulement nasal'],
 ARRAY['Virus de la rougeole', 'Transmission par gouttelettes'],
 ARRAY['Vaccination ROR', 'Isolement des malades'],
 'Traitement symptomatique, Vitamine A selon MINSANTE',
 'Repos, hydratation, compresses fraîches',
 'moderate', ARRAY['1-5', '5-10'], 12.30, true),

('Typhoid Fever', 'Fièvre Typhoïde', 'Bacterial', 
 ARRAY['Fièvre prolongée', 'Maux de tête', 'Fatigue', 'Douleurs abdominales'],
 ARRAY['Salmonella Typhi', 'Eau et aliments contaminés'],
 ARRAY['Vaccination', 'Hygiène alimentaire', 'Eau potable'],
 'Ciprofloxacine ou Azithromycine selon MINSANTE',
 'Hydratation, repos, tisanes antiseptiques',
 'severe', ARRAY['5-10', '10-15'], 8.70, true),

('Tuberculosis', 'Tuberculose', 'Bacterial', 
 ARRAY['Toux persistante', 'Fièvre', 'Perte de poids', 'Sueurs nocturnes'],
 ARRAY['Mycobacterium tuberculosis', 'Transmission aérienne'],
 ARRAY['Vaccination BCG', 'Dépistage précoce', 'Isolement'],
 'DOTS (Traitement Directement Observé) selon MINSANTE',
 'Alimentation riche, repos, air pur',
 'severe', ARRAY['1-5', '5-10', '10-15'], 5.40, true),

('Meningitis', 'Méningite', 'Bacterial/Viral', 
 ARRAY['Fièvre élevée', 'Maux de tête sévères', 'Raideur de nuque', 'Vomissements'],
 ARRAY['Infections bactériennes/virales', 'Transmission par gouttelettes'],
 ARRAY['Vaccination', 'Éviter les foules', 'Hygiène'],
 'Antibiotiques IV selon protocole MINSANTE urgence',
 'Aucun traitement naturel - URGENCE MÉDICALE',
 'critical', ARRAY['0-1', '1-5', '5-10'], 3.20, true),

('Cholera', 'Choléra', 'Bacterial', 
 ARRAY['Diarrhée aqueuse abondante', 'Vomissements', 'Déshydratation rapide'],
 ARRAY['Vibrio cholerae', 'Eau et aliments contaminés'],
 ARRAY['Hygiène de l\'eau', 'Assainissement', 'Vaccination'],
 'Réhydratation massive, Doxycycline selon MINSANTE',
 'Réhydratation naturelle immédiate requise',
 'critical', ARRAY['1-5', '5-10', '10-15'], 2.10, true),

('Yellow Fever', 'Fièvre Jaune', 'Viral', 
 ARRAY['Fièvre', 'Jaunisse', 'Vomissements', 'Saignements'],
 ARRAY['Virus de la fièvre jaune', 'Moustiques Aedes'],
 ARRAY['Vaccination obligatoire', 'Contrôle des moustiques'],
 'Traitement symptomatique selon protocole MINSANTE',
 'Repos strict, hydratation, éviter aspirine',
 'severe', ARRAY['1-5', '5-10', '10-15'], 1.80, true),

('Dengue Fever', 'Dengue', 'Viral', 
 ARRAY['Fièvre soudaine', 'Maux de tête', 'Douleurs musculaires', 'Éruption'],
 ARRAY['Virus dengue', 'Moustiques Aedes aegypti'],
 ARRAY['Élimination gîtes larvaires', 'Protection anti-moustiques'],
 'Traitement symptomatique, surveillance selon MINSANTE',
 'Papaye, repos, hydratation, éviter aspirine',
 'moderate', ARRAY['5-10', '10-15'], 6.50, true),

('Whooping Cough', 'Coqueluche', 'Bacterial', 
 ARRAY['Toux spasmodique', 'Quintes de toux', 'Vomissements post-toux'],
 ARRAY['Bordetella pertussis', 'Transmission par gouttelettes'],
 ARRAY['Vaccination DTCoq', 'Éviter contact avec malades'],
 'Azithromycine selon protocole MINSANTE',
 'Miel (>1 an), vapeur, repos',
 'moderate', ARRAY['0-1', '1-5'], 4.20, true),

('Chickenpox', 'Varicelle', 'Viral', 
 ARRAY['Éruption vésiculeuse', 'Fièvre', 'Démangeaisons'],
 ARRAY['Virus varicelle-zona', 'Contact direct/gouttelettes'],
 ARRAY['Vaccination', 'Isolement des malades'],
 'Traitement symptomatique selon MINSANTE',
 'Bains d\'avoine, calamine naturelle',
 'mild', ARRAY['1-5', '5-10'], 15.60, false),

('Hepatitis A', 'Hépatite A', 'Viral', 
 ARRAY['Jaunisse', 'Fatigue', 'Nausées', 'Douleurs abdominales'],
 ARRAY['Virus hépatite A', 'Transmission fécale-orale'],
 ARRAY['Vaccination', 'Hygiène des mains', 'Eau potable'],
 'Traitement symptomatique selon MINSANTE',
 'Repos, hydratation, éviter alcool',
 'moderate', ARRAY['5-10', '10-15'], 7.30, false),

('Sickle Cell Crisis', 'Crise Drépanocytaire', 'Genetic', 
 ARRAY['Douleurs osseuses', 'Fièvre', 'Gonflement', 'Fatigue'],
 ARRAY['Maladie génétique', 'Facteurs déclenchants'],
 ARRAY['Éviter déclencheurs', 'Hydratation', 'Suivi médical'],
 'Antalgiques, hydratation selon protocole MINSANTE',
 'Hydratation, repos, compresses chaudes',
 'severe', ARRAY['0-1', '1-5', '5-10', '10-15'], 20.30, false),

('Kwashiorkor', 'Kwashiorkor', 'Nutritional', 
 ARRAY['Œdèmes', 'Retard de croissance', 'Cheveux décolorés', 'Apathie'],
 ARRAY['Malnutrition protéique', 'Pauvreté', 'Sevrage précoce'],
 ARRAY['Allaitement maternel', 'Alimentation équilibrée'],
 'Réhabilitation nutritionnelle selon MINSANTE',
 'Alimentation progressive, protéines végétales',
 'severe', ARRAY['1-5', '5-10'], 11.20, false),

('Acute Respiratory Infection', 'Infection Respiratoire Aiguë', 'Respiratory', 
 ARRAY['Toux', 'Fièvre', 'Difficulté respiratoire', 'Écoulement nasal'],
 ARRAY['Virus respiratoires', 'Bactéries', 'Pollution'],
 ARRAY['Vaccination', 'Éviter fumée', 'Allaitement maternel'],
 'Antibiotiques si bactérien selon MINSANTE',
 'Vapeur, miel, hydratation, repos',
 'moderate', ARRAY['0-1', '1-5', '5-10'], 32.10, true),

('Anemia', 'Anémie', 'Nutritional', 
 ARRAY['Fatigue', 'Pâleur', 'Essoufflement', 'Faiblesse'],
 ARRAY['Carence en fer', 'Malnutrition', 'Parasites'],
 ARRAY['Alimentation riche en fer', 'Déparasitage'],
 'Supplémentation fer selon protocole MINSANTE',
 'Épinards, foie, légumineuses, moringa',
 'moderate', ARRAY['1-5', '5-10', '10-15'], 65.40, false),

('Scabies', 'Gale', 'Parasitic', 
 ARRAY['Démangeaisons nocturnes', 'Éruption cutanée', 'Lésions'],
 ARRAY['Sarcoptes scabiei', 'Contact direct prolongé'],
 ARRAY['Hygiène corporelle', 'Lavage vêtements'],
 'Perméthrine selon protocole MINSANTE',
 'Huile de neem, soufre naturel',
 'mild', ARRAY['1-5', '5-10', '10-15'], 18.90, false),

('Ringworm', 'Teigne', 'Fungal', 
 ARRAY['Plaques circulaires', 'Desquamation', 'Démangeaisons'],
 ARRAY['Champignons dermatophytes', 'Contact direct'],
 ARRAY['Hygiène corporelle', 'Éviter partage objets'],
 'Antifongiques topiques selon MINSANTE',
 'Ail, huile d\'arbre à thé',
 'mild', ARRAY['1-5', '5-10'], 14.70, false),

('Acute Malnutrition', 'Malnutrition Aiguë', 'Nutritional', 
 ARRAY['Perte de poids', 'Retard croissance', 'Faiblesse', 'Infections fréquentes'],
 ARRAY['Insuffisance alimentaire', 'Pauvreté', 'Maladies'],
 ARRAY['Sécurité alimentaire', 'Suivi croissance'],
 'Prise en charge nutritionnelle selon MINSANTE',
 'Aliments thérapeutiques locaux, spiruline',
 'severe', ARRAY['0-1', '1-5', '5-10'], 23.80, true),

('Acute Gastroenteritis', 'Gastro-entérite Aiguë', 'Gastrointestinal', 
 ARRAY['Diarrhée', 'Vomissements', 'Fièvre', 'Crampes abdominales'],
 ARRAY['Virus', 'Bactéries', 'Parasites', 'Aliments contaminés'],
 ARRAY['Hygiène alimentaire', 'Eau potable', 'Lavage mains'],
 'Réhydratation, probiotiques selon MINSANTE',
 'Bouillon, banane, riz, tisanes digestives',
 'moderate', ARRAY['0-1', '1-5', '5-10'], 28.30, true);
