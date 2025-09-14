import React from 'react';
import { Prediction } from '../../../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart } from 'lucide-react';

interface PredictionReportProps {
  prediction: Prediction;
}

const PredictionReport: React.FC<PredictionReportProps> = ({ prediction }) => {
  if (!prediction.child || !prediction.disease) {
    return null;
  }
  const { child, disease, symptoms, additional_info, confidence_score, created_at } = prediction;
  const confidencePercent = confidence_score ? (confidence_score * 100).toFixed(0) : 'N/A';

  const severityInfo = {
    mild: { text: 'Léger', color: 'text-green-700' },
    moderate: { text: 'Modéré', color: 'text-yellow-700' },
    severe: { text: 'Sévère', color: 'text-orange-700' },
    critical: { text: 'Critique', color: 'text-red-700' },
  };

  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mt-6">
      <h2 className="text-base font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-2">{title}</h2>
      <div className="text-sm text-gray-700 space-y-1">{children}</div>
    </div>
  );

  return (
    <div className="p-8 bg-white font-sans text-gray-800 border-4 border-gray-200 rounded-lg">
      <header className="flex justify-between items-start pb-4 border-b-4 border-primary-600">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center">
            <Heart className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">EpicTrack</h1>
            <p className="text-md text-gray-600">Rapport de Prédiction Sanitaire par IA</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p><strong>Date du Rapport:</strong> {format(new Date(created_at), 'd MMMM yyyy, HH:mm', { locale: fr })}</p>
          <p><strong>ID Prédiction:</strong> {prediction.id}</p>
        </div>
      </header>

      <main className="mt-6">
        <Section title="Informations du Patient">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <p><strong>Nom:</strong> {child.first_name} {child.last_name}</p>
            <p><strong>Sexe:</strong> {child.gender === 'male' ? 'Masculin' : 'Féminin'}</p>
            <p><strong>Date de Naissance:</strong> {format(new Date(child.date_of_birth), 'd MMMM yyyy', { locale: fr })}</p>
            <p><strong>Groupe Sanguin:</strong> {child.blood_type || 'Non spécifié'}</p>
          </div>
        </Section>

        <Section title="Informations Cliniques Renseignées">
          <div className="bg-gray-50 p-3 rounded-md">
            <p><strong>Symptômes principaux:</strong> {symptoms.selected_symptoms.join(', ')}</p>
            <p><strong>Durée des symptômes:</strong> {symptoms.duration}</p>
            <p><strong>Température:</strong> {symptoms.temperature ? `${symptoms.temperature}°C` : 'Non spécifiée'}</p>
            <p><strong>Niveau d'énergie:</strong> {additional_info?.energy_level || 'Non spécifié'}</p>
            <p><strong>Appétit:</strong> {additional_info?.appetite || 'Non spécifié'}</p>
            <p><strong>Hydratation:</strong> {additional_info?.hydration || 'Non spécifié'}</p>
            {additional_info?.details && <p><strong>Détails supplémentaires:</strong> {additional_info.details}</p>}
          </div>
        </Section>

        <Section title="Résultat de l'Analyse par Intelligence Artificielle">
          <div className="text-center bg-primary-50 p-4 rounded-lg my-2 border border-primary-200">
            <p className="text-md">Hypothèse diagnostique la plus probable</p>
            <h3 className="text-3xl font-bold text-primary-700 my-1">{disease.name_fr}</h3>
            <p className="text-md">avec une probabilité de <strong className="text-2xl">{confidencePercent}%</strong></p>
            <div className="mt-2 flex justify-center items-center space-x-4 text-sm">
              <span className={`font-semibold ${severityInfo[disease.severity_level].color}`}>Sévérité: {severityInfo[disease.severity_level].text}</span>
              {disease.is_epidemic_risk && <span className="font-semibold text-red-700">Risque Épidémique</span>}
            </div>
          </div>
        </Section>

        <Section title="Recommandations et Informations">
          <div className="space-y-3">
            <div>
              <h4 className="font-bold">Causes Possibles</h4>
              <p>{disease.causes.join(', ')}.</p>
            </div>
            <div>
              <h4 className="font-bold">Méthodes de Prévention</h4>
              <p>{disease.prevention_methods.join(', ')}.</p>
            </div>
            <div>
              <h4 className="font-bold">Traitement Standard (Protocole MINSANTE)</h4>
              <p>{disease.minsante_approved_treatment}</p>
            </div>
            <div>
              <h4 className="font-bold">Approche Naturelle Complémentaire (Indicatif)</h4>
              <p>{disease.natural_treatment || 'Non applicable.'}</p>
            </div>
          </div>
        </Section>
      </main>

      <footer className="mt-8 pt-4 border-t-2 border-dashed border-gray-300">
        <h4 className="font-bold text-center text-red-600 text-sm">AVERTISSEMENT IMPORTANT</h4>
        <p className="text-xs text-center text-gray-600 mt-1">
          Ce rapport est un outil d'aide à la décision généré par une IA et ne remplace en aucun cas un diagnostic, un avis ou une prescription d'un professionnel de santé qualifié. Il est impératif de consulter un médecin pour une évaluation complète. EpicTrack décline toute responsabilité en cas d'utilisation de ce rapport sans consultation médicale.
        </p>
      </footer>
    </div>
  );
};

export default PredictionReport;
