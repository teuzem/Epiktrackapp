import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase, Testimonial } from '../../lib/supabase';
import toast from 'react-hot-toast';

import StaticPageLayout from '../../components/layout/StaticPageLayout';
import SkeletonCard from '../../components/ui/SkeletonCard';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';
import SubmitTestimonialModal from '../../components/modals/SubmitTestimonialModal';
import { useAuth } from '../../contexts/AuthContext';
import { Quote } from 'lucide-react';

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        toast.error("Erreur lors de la récupération des témoignages.");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();

    const channel = supabase.channel('public:testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, fetchTestimonials)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const averageRating = useMemo(() => {
    if (testimonials.length === 0) return 0;
    const total = testimonials.reduce((acc, t) => acc + t.rating, 0);
    return (total / testimonials.length).toFixed(1);
  }, [testimonials]);

  return (
    <>
      <StaticPageLayout
        title="Ce que disent nos utilisateurs"
        subtitle="Découvrez les témoignages authentiques de familles camerounaises qui font confiance à EpicTrack pour la santé de leurs enfants."
        imageUrl="https://images.unsplash.com/photo-1530010464535-ac2a15a19d654956?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
      >
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600">Note moyenne</p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-4xl font-bold text-gray-900">{averageRating}</p>
            <StarRating rating={Number(averageRating)} size={24} />
          </div>
          <p className="text-gray-500">basé sur {testimonials.length} avis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col"
              >
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <StarRating rating={testimonial.rating} size={20} className="mb-4" />
                <p className="text-gray-600 mb-6 italic flex-grow">"{testimonial.content}"</p>
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-primary-600">{testimonial.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.full_name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Vous utilisez EpicTrack ?</h3>
          <p className="mt-2 text-gray-600">Votre avis est précieux. Aidez d'autres parents en partageant votre expérience.</p>
          <Button onClick={() => user ? setIsModalOpen(true) : toast.error('Veuillez vous connecter pour laisser un avis.')} className="mt-6">
            Laisser un témoignage
          </Button>
        </div>
      </StaticPageLayout>
      <SubmitTestimonialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default TestimonialsPage;
