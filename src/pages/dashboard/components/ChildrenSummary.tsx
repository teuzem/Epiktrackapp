import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Child } from '../../../lib/supabase';
import { Heart, PlusCircle, User } from 'lucide-react';
import { differenceInYears } from 'date-fns';

interface ChildrenSummaryProps {
  children: Child[];
}

const ChildrenSummary: React.FC<ChildrenSummaryProps> = ({ children }) => {
  return (
    <Card 
      title="Mes Enfants"
      action={
        <Link to="/children" className="text-sm font-medium text-primary-600 hover:underline flex items-center">
          Voir tout
        </Link>
      }
    >
      {children.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6" />}
          title="Aucun enfant enregistré"
          description="Commencez par ajouter le profil de votre enfant pour un suivi personnalisé."
          action={
            <Link to="/children/new">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                <PlusCircle className="w-4 h-4 mr-2" />
                Ajouter un enfant
              </button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {children.map(child => (
            <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {child.photo_url ? (
                  <img src={child.photo_url} alt={child.first_name} className="w-12 h-12 rounded-full object-cover mr-4" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800">{child.first_name} {child.last_name}</p>
                  <p className="text-sm text-gray-500">
                    {differenceInYears(new Date(), new Date(child.date_of_birth))} ans
                  </p>
                </div>
              </div>
              <Link to={`/prediction/${child.id}`}>
                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200">
                  Lancer une prédiction
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ChildrenSummary;
