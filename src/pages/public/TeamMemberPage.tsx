import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, TeamMember } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail, ArrowLeft } from 'lucide-react';

import Spinner from '../../components/ui/Spinner';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const TeamMemberPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', memberId)
          .single();
        
        if (error) throw error;
        setMember(data);
      } catch (error) {
        toast.error("Impossible de charger le profil du membre de l'équipe.");
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [memberId]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!member) {
    return (
      <StaticPageLayout title="Membre non trouvé" subtitle="Désolé, nous n'avons pas pu trouver ce profil.">
        <div className="text-center">
          <Link to="/team">
            <Button>Retour à la page équipe</Button>
          </Link>
        </div>
      </StaticPageLayout>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/team" className="inline-flex items-center text-primary-600 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'équipe
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-1 text-center"
          >
            <img src={member.avatar_url} alt={member.full_name} className="w-48 h-48 rounded-full mx-auto object-cover shadow-2xl mb-4 border-4 border-white" />
            <h1 className="text-3xl font-bold text-gray-900">{member.full_name}</h1>
            <p className="text-xl text-primary-600 font-semibold">{member.role}</p>
            <div className="flex justify-center space-x-4 mt-4">
              {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary-600"><Linkedin /></a>}
              {member.twitter_url && <a href={member.twitter_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary-600"><Twitter /></a>}
              <a href={`mailto:${member.full_name.split(' ')[0].toLowerCase()}@epictrack.cm`} className="text-gray-500 hover:text-primary-600"><Mail /></a>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 prose prose-lg max-w-full text-gray-600"
          >
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Biographie</h2>
            <p>{member.bio}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberPage;
