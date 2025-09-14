import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, Child } from '../../lib/supabase';
import ChildForm, { ChildFormData } from './ChildForm';
import Spinner from '../../components/ui/Spinner';

const EditChildPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      if (!id) {
        navigate('/children');
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setChild(data);
      } catch (error) {
        toast.error("Impossible de charger les informations de l'enfant.");
        navigate('/children');
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
  }, [id, navigate]);

  const handleUpdateChild = async (data: ChildFormData, photoFile: File | null) => {
    if (!id || !child) return;

    setIsSubmitting(true);
    try {
      let photo_url = child.photo_url;

      // Handle photo upload if a new file is provided
      if (photoFile) {
        // First, remove the old photo if it exists
        if (child.photo_url) {
          const oldPath = new URL(child.photo_url).pathname.split('/children_photos/')[1];
          await supabase.storage.from('children_photos').remove([oldPath]);
        }
        
        // Upload the new photo
        const fileExt = photoFile.name.split('.').pop();
        const filePath = `${id}/${new Date().getTime()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('children_photos')
          .upload(filePath, photoFile);
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('children_photos')
          .getPublicUrl(filePath);
        photo_url = urlData.publicUrl;
      }

      // Update the child record
      const { error: updateError } = await supabase
        .from('children')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          blood_type: data.blood_type,
          allergies: data.allergies?.split(',').map(s => s.trim()).filter(Boolean),
          chronic_conditions: data.chronic_conditions?.split(',').map(s => s.trim()).filter(Boolean),
          photo_url: photo_url,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success("Profil enfant mis à jour avec succès !");
      navigate('/children');

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour.");
      console.error(error);
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

  const defaultValues = {
    ...child,
    allergies: child.allergies?.join(', '),
    chronic_conditions: child.chronic_conditions?.join(', '),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier le Profil de {child.first_name}</h1>
        <ChildForm
          onSubmit={handleUpdateChild}
          isSubmitting={isSubmitting}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
};

export default EditChildPage;
