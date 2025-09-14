import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { Check, ChevronDown } from 'lucide-react';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PredictionFormData>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      symptoms: [],
      energy_level: 'normal',
      appetite: 'normal',
      hydration: 'bonne',
    },
  });

  const selectedSymptoms = watch('symptoms');

  const handleSymptomToggle = (symptom: string) => {
    const currentSymptoms = selectedSymptoms || [];
    const newSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter(s => s !== symptom)
      : [...currentSymptoms, symptom];
    setValue('symptoms', newSymptoms, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <div className="space-y-6">
          
          <div>
            <Label>Symptômes observés *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex justify-between items-center"
              >
                <span className={selectedSymptoms.length > 0 ? 'text-gray-800' : 'text-gray-500'}>
                  {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} symptôme(s) sélectionné(s)` : 'Sélectionner les symptômes...'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {commonSymptoms.map(symptom => (
                    <div
                      key={symptom}
                      onClick={() => handleSymptomToggle(symptom)}
                      className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      <span>{symptom}</span>
                      {selectedSymptoms.includes(symptom) && <Check className="w-5 h-5 text-primary-600" />}
                    </div>
                  ))}
                </div>
              )}
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
              <select {...register('energy_level')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="normal">Normal</option>
                <option value="fatigue">Fatigué</option>
                <option value="faible">Très faible</option>
              </select>
            </div>
            <div>
              <Label htmlFor="appetite">Appétit</Label>
              <select {...register('appetite')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="normal">Normal</option>
                <option value="diminue">Diminué</option>
                <option value="augmente">Augmenté</option>
              </select>
            </div>
            <div>
              <Label htmlFor="hydration">Hydratation</Label>
              <select {...register('hydration')} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="bonne">Bonne</option>
                <option value="moyenne">Moyenne</option>
                <option value="mauvaise">Mauvaise</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="details">Autres détails ou observations</Label>
            <textarea
              id="details"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Décrivez tout autre signe pertinent (ex: éruption cutanée, comportement inhabituel...)"
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
