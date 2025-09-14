import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import { BrainCircuit, CalendarPlus, Heart } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <Card title="Actions Rapides">
      <div className="space-y-4">
        <Link to="/prediction/start" className="w-full">
          <button className="w-full flex items-center text-left p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
            <BrainCircuit className="w-6 h-6 text-primary-700 mr-4" />
            <div>
              <p className="font-semibold text-primary-800">Nouvelle Prédiction</p>
              <p className="text-sm text-primary-700">Lancer une analyse de symptômes.</p>
            </div>
          </button>
        </Link>
        <Link to="/children/new" className="w-full">
          <button className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-6 h-6 text-gray-700 mr-4" />
            <div>
              <p className="font-semibold text-gray-800">Ajouter un Enfant</p>
              <p className="text-sm text-gray-600">Créer un nouveau profil enfant.</p>
            </div>
          </button>
        </Link>
        <Link to="/appointments/new" className="w-full">
          <button className="w-full flex items-center text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <CalendarPlus className="w-6 h-6 text-gray-700 mr-4" />
            <div>
              <p className="font-semibold text-gray-800">Prendre Rendez-vous</p>
              <p className="text-sm text-gray-600">Planifier une consultation.</p>
            </div>
          </button>
        </Link>
      </div>
    </Card>
  );
};

export default QuickActions;
