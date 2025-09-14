import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ImageUpload from '../../components/ui/ImageUpload';
import { Child } from '../../lib/supabase';

const childFormSchema = z.object({
  first_name: z.string().min(2, "Le prénom est requis."),
  last_name: z.string().min(2, "Le nom est requis."),
  date_of_birth: z.string().min(1, "La date de naissance est requise."),
  gender: z.enum(['male', 'female'], { required_error: "Le sexe est requis." }),
  blood_type: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
});

export type ChildFormData = z.infer<typeof childFormSchema>;

interface ChildFormProps {
  onSubmit: (data: ChildFormData, photoFile: File | null) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Child>;
}

const ChildForm: React.FC<ChildFormProps> = ({ onSubmit, isSubmitting, defaultValues }) => {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      first_name: defaultValues?.first_name || '',
      last_name: defaultValues?.last_name || '',
      date_of_birth: defaultValues?.date_of_birth ? defaultValues.date_of_birth.split('T')[0] : '',
      gender: defaultValues?.gender,
      blood_type: defaultValues?.blood_type || '',
      allergies: Array.isArray(defaultValues?.allergies) ? defaultValues.allergies.join(', ') : '',
      chronic_conditions: Array.isArray(defaultValues?.chronic_conditions) ? defaultValues.chronic_conditions.join(', ') : '',
    },
  });

  const handleFormSubmit = (data: ChildFormData) => {
    onSubmit(data, photoFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card>
        <div className="space-y-6">
          <div className="text-center">
            <ImageUpload 
              onFileSelect={setPhotoFile} 
              defaultImage={defaultValues?.photo_url}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date_of_birth">Date de naissance</Label>
              <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>}
            </div>
            <div>
              <Label>Sexe</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="">Sélectionner...</option>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                  </select>
                )}
              />
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="blood_type">Groupe Sanguin</Label>
            <Input id="blood_type" {...register('blood_type')} placeholder="Ex: O+, A-" />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies connues</Label>
            <textarea
              id="allergies"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Séparez par des virgules (ex: Pénicilline, Arachides)"
              {...register('allergies')}
            />
          </div>

          <div>
            <Label htmlFor="chronic_conditions">Conditions chroniques</Label>
            <textarea
              id="chronic_conditions"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Séparez par des virgules (ex: Asthme, Drépanocytose)"
              {...register('chronic_conditions')}
            />
          </div>
        </div>
        <div className="mt-8 flex space-x-4">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            {defaultValues ? 'Enregistrer les modifications' : 'Ajouter l’enfant'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/children')} className="flex-1">
            Annuler
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default ChildForm;
