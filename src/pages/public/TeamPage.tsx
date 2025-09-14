import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, TeamMember } from '../../lib/supabase';
import toast from 'react-hot-toast';

import StaticPageLayout from '../../components/layout/StaticPageLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { Linkedin, Twitter, Search, Briefcase } from 'lucide-react';

const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Tous');

  const departments = ['Tous', 'Direction', 'Technique', 'Médical', 'Opérations'];

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        toast.error("Erreur lors de la récupération de l'équipe.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(member => 
        departmentFilter === 'Tous' || member.department === departmentFilter
      );
  }, [members, searchTerm, departmentFilter]);

  return (
    <StaticPageLayout
      title="Notre Équipe"
      subtitle="Découvrez les experts passionnés qui travaillent chaque jour pour améliorer la santé infantile au Cameroun."
      imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
    >
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Rechercher par nom ou rôle..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          filteredMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="text-center h-full flex flex-col">
                <div className="flex-grow">
                  <img src={member.avatar_url} alt={member.full_name} className="w-28 h-28 rounded-full mx-auto mb-4 object-cover shadow-lg" />
                  <h3 className="text-xl font-bold text-gray-900">{member.full_name}</h3>
                  <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio.substring(0, 100)}...</p>
                </div>
                <div className="mt-auto">
                  <Link to={`/team/${member.id}`}>
                    <Button variant="secondary" className="w-full mb-3">Voir le profil</Button>
                  </Link>
                  <div className="flex justify-center space-x-4">
                    {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600"><Linkedin /></a>}
                    {member.twitter_url && <a href={member.twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600"><Twitter /></a>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-20 text-center bg-gray-50 p-10 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900">Faites partie de l'aventure</h2>
        <p className="mt-4 max-w-2xl mx-auto text-gray-600">Nous sommes toujours à la recherche de talents passionnés pour rejoindre notre mission. Consultez nos offres ou soumettez une candidature spontanée.</p>
        <Link to="/join-team" className="mt-6 inline-block">
          <Button>
            <Briefcase className="mr-2 h-5 w-5" />
            Rejoindre l'équipe
          </Button>
        </Link>
      </div>
    </StaticPageLayout>
  );
};

export default TeamPage;
