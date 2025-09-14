import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, Child } from '../../lib/supabase';
import { runPrediction, getCommonSymptoms } from '../../services/predictionService';

import PredictionForm, { PredictionFormData } from './components/PredictionForm';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { User } from 'lucide-react';
import { differenceInYears } from 'date-fns';

const PredictionPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) {
        toast.error("ID de l'enfant manquant.");
        navigate('/prediction/start');
        return;
      }
      setLoading(true);
      try {
        // Fetch child data
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .single();
        if (childError) throw childError;
        setChild(childData);

        // Fetch common symptoms
        const symptoms = await getCommonSymptoms();
        setCommonSymptoms(symptoms);
      } catch (error) {
        toast.error("Impossible de charger les informations nécessaires.");
        navigate('/prediction/start');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId, navigate]);

  const handlePrediction = async (data: PredictionFormData) => {
    if (!child) return;
    setIsSubmitting(true);
    try {
      const predictionResult = await runPrediction(child, data);
      toast.success("Prédiction terminée avec succès !");
      navigate(`/prediction/result/${predictionResult.id}`);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la prédiction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  if (!child) {
    return <div className="text-center py-10">Profil enfant non trouvé.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analyse des Symptômes</h1>
        </div>

        <Card className="mb-8">
          <div className="flex items-center">
            {child.photo_url ? (
              <img src={child.photo_url} alt={child.first_name} className="w-16 h-16 rounded-full object-cover mr-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{child.first_name} {child.last_name}</h2>
              <p className="text-gray-500">{differenceInYears(new Date(), new Date(child.date_of_birth))} ans</p>
            </div>
          </div>
        </Card>
        
        <PredictionForm
          onSubmit={handlePrediction}
          isSubmitting={isSubmitting}
          commonSymptoms={commonSymptoms}
        />
      </div>
    </div>
  );
};

export default PredictionPage;
