import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Label from '../ui/Label';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

const testimonialSchema = z.object({
  content: z.string().min(20, "Le témoignage doit contenir au moins 20 caractères."),
  rating: z.number().min(1, "Veuillez donner une note.").max(5),
  location: z.string().optional(),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

interface SubmitTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitTestimonialModal: React.FC<SubmitTestimonialModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch('rating');

  const onSubmit = async (data: TestimonialFormData) => {
    if (!user || !profile) {
      toast.error("Vous devez être connecté pour laisser un témoignage.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('testimonials').insert({
        user_id: user.id,
        full_name: `${profile.first_name} ${profile.last_name}`,
        content: data.content,
        rating: data.rating,
        location: data.location,
        status: 'pending',
      });

      if (error) throw error;

      toast.success("Merci ! Votre témoignage a été soumis et sera examiné par notre équipe.", { duration: 5000 });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              <X />
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Partagez votre expérience</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label>Votre note</Label>
                <StarRating rating={rating} setRating={(r) => setValue('rating', r, { shouldValidate: true })} size={28} />
                {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>}
              </div>
              <div>
                <Label htmlFor="content">Votre témoignage</Label>
                <textarea
                  id="content"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  {...register('content')}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
              </div>
              <div>
                <Label htmlFor="location">Votre ville (optionnel)</Label>
                <Input id="location" placeholder="Ex: Douala" {...register('location')} />
              </div>
              <Button type="submit" isLoading={isLoading} className="w-full">
                Soumettre mon témoignage
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubmitTestimonialModal;
