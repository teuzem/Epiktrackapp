import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const predictionFormSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Veuillez sélectionner au moins un symptôme."),
  temperature: z.string().optional(),
  duration: z.string().min(1, "La durée des symptômes est requise."),
  details: z.string().optional(),
  energy_level: z.enum(['normal', 'fatigue', 'faible']),
  appetite: z.enum(['normal', 'diminue', 'augmente']),
  hydration: z.enum(['bonne', 'moyenne', 'mauvaise']),
});

export type PredictionFormData = z.infer<typeof predictionFormSchema>;

interface PredictionFormProps {
  onSubmit: (data: PredictionFormData) => void;
  isSubmitting: boolean;
  commonSymptoms: string[];
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isSubmitting, commonSymptoms }) => {
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors } } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      symptoms: [],
      energy_level: 'normal',
      appetite: 'normal',
      hydration: 'bonne',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <div className="space-y-6">
          <div>
            <Label>Symptômes observés *</Label>
            <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
              <Controller
                name="symptoms"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {commonSymptoms.map(symptom => (
                      <div key={symptom} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`symptom-${symptom}`}
                          value={symptom}
                          checked={field.value?.includes(symptom)}
                          onChange={(e) => {
                            const newSymptoms = e.target.checked
                              ? [...(field.value || []), symptom]
                              : (field.value || []).filter(s => s !== symptom);
                            field.onChange(newSymptoms);
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`symptom-${symptom}`} className="ml-3 block text-sm text-gray-700">
                          {symptom}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
            {errors.symptoms && <p className="text-red-500 text-sm mt-1">{errors.symptoms.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input id="temperature" type="number" step="0.1" {...register('temperature')} placeholder="Ex: 38.5" />
            </div>
            <div>
              <Label htmlFor="duration">Durée des symptômes *</Label>
              <Input id="duration" {...register('duration')} placeholder="Ex: 3 jours" />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="energy_level">Niveau d'énergie</Label>
              <select id="energy_level" {...register('energy_level')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="normal">Normal</option>
                <option value="fatigue">Fatigué</option>
                <option value="faible">Faible</option>
              </select>
            </div>
            <div>
              <Label htmlFor="appetite">Appétit</Label>
              <select id="appetite" {...register('appetite')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="normal">Normal</option>
                <option value="diminue">Diminué</option>
                <option value="augmente">Augmenté</option>
              </select>
            </div>
            <div>
              <Label htmlFor="hydration">Hydratation</Label>
              <select id="hydration" {...register('hydration')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="bonne">Bonne</option>
                <option value="moyenne">Moyenne</option>
                <option value="mauvaise">Mauvaise</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="details">Autres détails</Label>
            <textarea
              id="details"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Décrivez tout autre signe pertinent..."
              {...register('details')}
            />
          </div>
        </div>
        <div className="mt-8 flex space-x-4">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Lancer la prédiction
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
            Annuler
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default PredictionForm;
