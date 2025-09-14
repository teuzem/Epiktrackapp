import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Child, Profile, DoctorProfile } from '../../lib/supabase';
import { createAppointmentAfterPayment, getAvailableDoctors } from '../../services/appointmentService';

import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PaymentButton from './components/PaymentButton';
import { Stethoscope, Calendar, Clock, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Veuillez choisir un médecin."),
  childId: z.string().min(1, "Veuillez choisir un enfant."),
  date: z.string().min(1, "Veuillez choisir une date."),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Veuillez entrer une heure valide (HH:MM)."),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type DoctorWithProfile = DoctorProfile & { profiles: Profile };

const NewAppointmentPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithProfile[]>([]);
  const [step, setStep] = useState(1);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      childId: searchParams.get('child') || '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
    },
  });

  const formData = watch();
  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
  const selectedChild = children.find(c => c.id === formData.childId);
  const predictionId = searchParams.get('prediction') || undefined;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [doctorsData, childrenData] = await Promise.all([
          getAvailableDoctors(),
          supabase.from('children').select('*').eq('parent_id', user.id)
        ]);

        if (doctorsData.error) throw doctorsData.error;
        if (childrenData.error) throw childrenData.error;

        setDoctors(doctorsData.data as DoctorWithProfile[] || []);
        setChildren(childrenData.data || []);
      } catch (error) {
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleFormSubmit = () => {
    const [hour] = formData.time.split(':').map(Number);
    if (hour < 9 || hour >= 17) {
      toast.error("Veuillez choisir une heure entre 09:00 et 17:00.");
      return;
    }
    setStep(2);
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user || !selectedDoctor || !selectedChild || !formData.date || !formData.time) {
      toast.error("Informations manquantes pour créer le rendez-vous.");
      return;
    }
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      const newAppointment = await createAppointmentAfterPayment({
        parentId: user.id,
        doctorId: selectedDoctor.id,
        childId: selectedChild.id,
        scheduledAt: scheduledAt.toISOString(),
        fee: selectedDoctor.consultation_fee,
        paymentReference: reference,
        predictionId: predictionId,
      });
      toast.success("Rendez-vous confirmé avec succès !");
      navigate(`/payment/success/${newAppointment.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la confirmation du rendez-vous.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Prendre un Rendez-vous</h1>
        
        {step === 1 && (
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Card>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="childId">Pour quel enfant ? *</Label>
                  <Controller
                    name="childId"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <option value="">Sélectionner un enfant...</option>
                        {children.map(child => <option key={child.id} value={child.id}>{child.first_name} {child.last_name}</option>)}
                      </select>
                    )}
                  />
                  {errors.childId && <p className="text-red-500 text-sm mt-1">{errors.childId.message}</p>}
                </div>
                <div>
                  <Label htmlFor="doctorId">Choisir un médecin *</Label>
                  <Controller
                    name="doctorId"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <option value="">Sélectionner un médecin...</option>
                        {doctors.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.profiles.first_name} {doc.profiles.last_name} ({doc.specialization})</option>)}
                      </select>
                    )}
                  />
                  {errors.doctorId && <p className="text-red-500 text-sm mt-1">{errors.doctorId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />}
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="time">Heure *</Label>
                        <Controller
                            name="time"
                            control={control}
                            render={({ field }) => <Input type="time" {...field} />}
                        />
                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                    </div>
                </div>
              </div>
              <div className="mt-8">
                <Button type="submit">Continuer vers le paiement</Button>
              </div>
            </Card>
          </form>
        )}

        {step === 2 && profile && selectedDoctor && selectedChild && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Récapitulatif et Paiement</h2>
            <div className="space-y-4 text-gray-700 p-4 bg-gray-50 rounded-lg">
              <p className="flex items-center"><Heart className="w-5 h-5 mr-3 text-primary-600"/> <strong>Patient:</strong> {selectedChild.first_name} {selectedChild.last_name}</p>
              <p className="flex items-center"><Stethoscope className="w-5 h-5 mr-3 text-primary-600"/> <strong>Médecin:</strong> Dr. {selectedDoctor.profiles.first_name} {selectedDoctor.profiles.last_name}</p>
              <p className="flex items-center"><Calendar className="w-5 h-5 mr-3 text-primary-600"/> <strong>Date:</strong> {format(new Date(`${formData.date}T00:00:00`), 'd MMMM yyyy', { locale: fr })}</p>
              <p className="flex items-center"><Clock className="w-5 h-5 mr-3 text-primary-600"/> <strong>Heure:</strong> {formData.time}</p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg">Montant total à payer :</p>
              <p className="text-4xl font-bold text-primary-600 my-2">{new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(selectedDoctor.consultation_fee)}</p>
            </div>
            <div className="mt-8">
              <PaymentButton
                email={profile.email}
                amount={selectedDoctor.consultation_fee * 100}
                onSuccess={handlePaymentSuccess}
              />
              <Button variant="secondary" onClick={() => setStep(1)} className="mt-4">Modifier</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewAppointmentPage;
