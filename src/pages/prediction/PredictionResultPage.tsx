import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Prediction } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PredictionReport from './components/PredictionReport';
import { AlertTriangle, Download, Stethoscope } from 'lucide-react';

const PredictionResultPage: React.FC = () => {
  const { predictionId } = useParams<{ predictionId: string }>();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!predictionId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*, child:children(*), disease:diseases(*)')
          .eq('id', predictionId)
          .single();
        if (error) throw error;
        setPrediction(data);
      } catch (error) {
        toast.error("Impossible de charger le résultat de la prédiction.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [predictionId]);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    toast.loading('Génération du PDF...', { id: 'pdf-toast' });
    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / pdfWidth;
      const pdfHeight = imgHeight / ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-prediction-${prediction?.child?.first_name}-${prediction?.id.substring(0, 8)}.pdf`);
      toast.success('Rapport téléchargé !', { id: 'pdf-toast' });
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF.", { id: 'pdf-toast' });
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  if (!prediction || !prediction.disease || !prediction.child) {
    return <div className="text-center py-10">Résultat de la prédiction non trouvé.</div>;
  }

  const { disease, child } = prediction;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Résultat de la Prédiction</h1>
          <p className="mt-2 text-lg text-gray-600">Analyse pour {child.first_name} {child.last_name}</p>
        </div>

        <div className="p-4">
          <PredictionReport prediction={prediction} />
        </div>
        
        <Card className="mt-8 bg-primary-50 border-primary-200">
          <div className="text-center">
            <AlertTriangle className="w-10 h-10 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">Avertissement Important</h3>
            <p className="text-gray-600 mt-2 mb-6 max-w-2xl mx-auto">
              Ce diagnostic est généré par une intelligence artificielle et ne remplace PAS un avis médical professionnel. 
              Pour confirmer ce résultat et obtenir une prescription, veuillez consulter un médecin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/appointments/new?disease=${disease.id}&child=${child.id}&prediction=${prediction.id}`}>
                <Button>
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Prendre rendez-vous
                </Button>
              </Link>
              <Button onClick={handleDownload} isLoading={isDownloading} variant="secondary">
                <Download className="mr-2 h-5 w-5" />
                Télécharger le rapport
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Hidden component for PDF generation */}
      <div className="absolute -left-[9999px] top-0 w-[210mm]">
        <div ref={reportRef}>
          <PredictionReport prediction={prediction} />
        </div>
      </div>
    </div>
  );
};

export default PredictionResultPage;
