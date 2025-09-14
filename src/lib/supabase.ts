import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  role: 'parent' | 'doctor' | 'admin'
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
  location?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  parent_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female'
  blood_type?: string
  allergies?: string[]
  chronic_conditions?: string[]
  vaccination_status: Record<string, any>
  weight_history: Array<{ date: string; weight: number }>
  height_history: Array<{ date: string; height: number }>
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Disease {
  id: string
  name: string
  name_fr: string
  category: string
  common_symptoms: string[]
  causes: string[]
  prevention_methods: string[]
  minsante_approved_treatment: string
  natural_treatment: string
  severity_level: 'mild' | 'moderate' | 'severe' | 'critical'
  age_group: string[]
  prevalence_in_cameroon: number
  is_epidemic_risk: boolean
  created_at: string
}

export interface Prediction {
  id: string
  child_id: string
  symptoms: Record<string, any>
  additional_info: Record<string, any>
  predicted_disease_id?: string
  confidence_score?: number
  ml_model_version?: string
  status: 'pending' | 'completed' | 'confirmed' | 'disputed'
  report_generated_at?: string
  report_downloaded: boolean
  created_at: string
  disease?: Disease
  child?: Child
}

export interface Appointment {
  id: string
  prediction_id?: string
  parent_id: string
  doctor_id: string
  child_id: string
  scheduled_at: string
  duration_minutes: number
  consultation_type: 'video' | 'chat' | 'phone'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  fee_amount: number
  meeting_link?: string
  meeting_id?: string
  notes?: string
  prescription: Record<string, any>
  diagnosis_confirmed?: boolean
  ai_diagnosis_accuracy?: string
  created_at: string
  completed_at?: string
  doctor?: Profile
  parent?: Profile
  child?: Child
  prediction?: Prediction
}

export interface Payment {
  id: string
  appointment_id: string
  parent_id: string
  amount: number
  currency: string
  payment_method: string
  payment_provider: string
  transaction_id?: string
  reference: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  paid_at?: string
  metadata: Record<string, any>
  created_at: string
}

export interface Message {
  id: string
  appointment_id?: string
  sender_id: string
  receiver_id: string
  content?: string
  message_type: 'text' | 'image' | 'file' | 'sticker' | 'gif'
  file_url?: string
  sticker_url?: string
  read_at?: string
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface DoctorProfile {
  id: string
  license_number: string
  specialization: string
  experience_years: number
  hospital_affiliation?: string
  consultation_fee: number
  bio?: string
  languages: string[]
  is_available: boolean
  rating: number
  total_consultations: number
  verified_by_minsante: boolean
  created_at: string
  profile?: Profile
}
