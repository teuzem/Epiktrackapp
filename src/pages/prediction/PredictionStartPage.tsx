import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Child } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Heart, User, ArrowRight, PlusCircle } from 'lucide-react';
import { differenceInYears } from 'date-fns';

import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PredictionStartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setChildren(data || []);
      } catch (error: any) {
        toast.error("Erreur lors de la récupération des profils enfants.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Lancer une Prédiction</h1>
          <p className="mt-2 text-lg text-gray-600">Pour qui souhaitez-vous démarrer une analyse de symptômes ?</p>
        </div>

        {children.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-10 h-10" />}
            title="Aucun enfant enregistré"
            description="Vous devez d'abord ajouter un enfant pour pouvoir lancer une prédiction."
            action={
              <Link to="/children/new">
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Ajouter un enfant
                </Button>
              </Link>
            }
          />
        ) : (
          <Card>
            <div className="space-y-4">
              {children.map(child => (
                <Link 
                  key={child.id} 
                  to={`/prediction/${child.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {child.photo_url ? (
                        <img src={child.photo_url} alt={child.first_name} className="w-16 h-16 rounded-full object-cover mr-4" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                          <User className="w-8 h-8 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">{child.first_name} {child.last_name}</h2>
                        <p className="text-gray-500">{differenceInYears(new Date(), new Date(child.date_of_birth))} ans</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PredictionStartPage;
