import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Child } from '../../lib/supabase';
import ChildForm, { ChildFormData } from './ChildForm';

const NewChildPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddChild = async (data: ChildFormData, photoFile: File | null) => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter un enfant.");
      return;
    }

    setIsSubmitting(true);
    try {
      let photo_url: string | undefined = undefined;

      // 1. Insert child data to get an ID
      const { data: newChild, error: insertError } = await supabase
        .from('children')
        .insert({
          parent_id: user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          blood_type: data.blood_type,
          allergies: data.allergies?.split(',').map(s => s.trim()).filter(Boolean),
          chronic_conditions: data.chronic_conditions?.split(',').map(s => s.trim()).filter(Boolean),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newChild) throw new Error("La création du profil a échoué.");

      // 2. Upload photo if it exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const filePath = `${newChild.id}/${new Date().getTime()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('children_photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          // If upload fails, we should ideally roll back the insert, but for now, we'll just log it.
          toast.error("Le profil a été créé, mais le téléversement de la photo a échoué.");
          console.error(uploadError);
        } else {
          // 3. Get public URL and update the record
          const { data: urlData } = supabase.storage
            .from('children_photos')
            .getPublicUrl(filePath);
          
          photo_url = urlData.publicUrl;

          const { error: updateError } = await supabase
            .from('children')
            .update({ photo_url })
            .eq('id', newChild.id);
          
          if (updateError) {
            toast.error("La mise à jour de l'URL de la photo a échoué.");
            console.error(updateError);
          }
        }
      }

      toast.success("Profil enfant ajouté avec succès !");
      navigate('/children');

    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ajouter un Enfant</h1>
        <ChildForm onSubmit={handleAddChild} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default NewChildPage;
