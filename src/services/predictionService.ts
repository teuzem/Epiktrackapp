import { supabase, Child } from '../lib/supabase';
import { PredictionFormData } from '../pages/prediction/components/PredictionForm';

// Mock function to simulate calling the ML model API
const mockMLApiCall = async (child: Child, symptoms: PredictionFormData): Promise<{ predicted_disease_id: string; confidence_score: number }> => {
  // In a real app, this would be a fetch call to VITE_ML_API_ENDPOINT
  console.log("Simulating ML API call with child profile and symptoms:", { child, symptoms });

  // 1. Fetch all diseases from Supabase
  const { data: diseases, error } = await supabase.from('diseases').select('id, age_group');
  if (error || !diseases || diseases.length === 0) {
    throw new Error("Impossible de récupérer les maladies pour la simulation.");
  }

  // 2. A slightly more "intelligent" mock: filter diseases by age group if possible
  // This is a simple simulation of how a real model would use patient data.
  // const childAge = differenceInYears(new Date(), new Date(child.date_of_birth));
  // A real implementation would parse the age_group string like "0-5 years", "6-12 years"
  // For this mock, we'll just keep it random but show that we have access to child data.

  const randomIndex = Math.floor(Math.random() * diseases.length);
  const randomDiseaseId = diseases[randomIndex].id;

  // 3. Generate a random confidence score, slightly influenced by the number of symptoms
  const baseConfidence = 0.70;
  const symptomBonus = Math.min(symptoms.symptoms.length * 0.03, 0.25); // More symptoms = higher confidence, capped
  const randomFactor = Math.random() * 0.05;
  const finalConfidence = Math.min(baseConfidence + symptomBonus + randomFactor, 0.98);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    predicted_disease_id: randomDiseaseId,
    confidence_score: finalConfidence,
  };
};

export const runPrediction = async (child: Child, formData: PredictionFormData) => {
  // 1. Call the mock ML model with the full child object
  const mlResult = await mockMLApiCall(child, formData);

  // 2. Prepare data for insertion into Supabase
  const predictionData = {
    child_id: child.id,
    symptoms: {
      selected_symptoms: formData.symptoms,
      temperature: formData.temperature,
      duration: formData.duration,
    },
    additional_info: {
      details: formData.details,
      energy_level: formData.energy_level,
      appetite: formData.appetite,
      hydration: formData.hydration,
    },
    predicted_disease_id: mlResult.predicted_disease_id,
    confidence_score: mlResult.confidence_score,
    ml_model_version: '1.1.0-mock-enhanced',
    status: 'completed' as const,
  };

  // 3. Save the complete prediction to the 'predictions' table
  const { data: savedPrediction, error } = await supabase
    .from('predictions')
    .insert(predictionData)
    .select()
    .single();

  if (error) {
    console.error("Error saving prediction:", error);
    throw new Error("Une erreur est survenue lors de l'enregistrement de la prédiction.");
  }

  return savedPrediction;
};

export const getCommonSymptoms = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('diseases').select('common_symptoms');
  if (error) {
    console.error("Error fetching symptoms:", error);
    return [];
  }

  const allSymptoms = data.flatMap(d => d.common_symptoms);
  const uniqueSymptoms = [...new Set(allSymptoms)];
  
  // Sort alphabetically in French
  uniqueSymptoms.sort((a, b) => a.localeCompare(b, 'fr'));

  return uniqueSymptoms;
};
