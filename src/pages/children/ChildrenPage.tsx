import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Child } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { PlusCircle, Heart, User, Edit, Trash2 } from 'lucide-react';
import { differenceInYears } from 'date-fns';

import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ChildrenPage: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (childId: string, photoUrl: string | undefined) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce profil ? Cette action est irréversible.")) {
      return;
    }
    setDeletingId(childId);
    try {
      // First, delete photo from storage if it exists
      if (photoUrl) {
        const path = new URL(photoUrl).pathname.split('/children_photos/')[1];
        const { error: storageError } = await supabase.storage.from('children_photos').remove([path]);
        if (storageError) {
          // Log error but continue to delete the record
          console.error("Could not delete photo, but proceeding with record deletion:", storageError.message);
        }
      }

      // Then, delete the record from the table
      const { error } = await supabase.from('children').delete().eq('id', childId);
      if (error) throw error;

      setChildren(children.filter(c => c.id !== childId));
      toast.success("Profil enfant supprimé avec succès.");

    } catch (error: any) {
      toast.error("Erreur lors de la suppression du profil.");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Enfants</h1>
        <Link to="/children/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter un enfant
          </Button>
        </Link>
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-10 h-10" />}
          title="Aucun enfant enregistré"
          description="Commencez par ajouter le profil de votre enfant pour un suivi personnalisé et des prédictions de santé."
          action={
            <Link to="/children/new">
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" />
                Ajouter mon premier enfant
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(child => (
            <Card key={child.id} className="flex flex-col">
              <div className="flex-grow">
                <div className="flex items-center mb-4">
                  {child.photo_url ? (
                    <img src={child.photo_url} alt={child.first_name} className="w-20 h-20 rounded-full object-cover mr-4" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{child.first_name} {child.last_name}</h2>
                    <p className="text-gray-500">{differenceInYears(new Date(), new Date(child.date_of_birth))} ans</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Sexe:</strong> <span className="capitalize">{child.gender === 'male' ? 'Masculin' : 'Féminin'}</span></p>
                  <p><strong>Groupe Sanguin:</strong> {child.blood_type || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-2">
                <Link to={`/children/edit/${child.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100"
                  onClick={() => handleDelete(child.id, child.photo_url)}
                  isLoading={deletingId === child.id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildrenPage;
