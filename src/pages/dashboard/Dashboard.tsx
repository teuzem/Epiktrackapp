import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Child, Appointment, Prediction } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import WelcomeHeader from './components/WelcomeHeader';
import StatsGrid from './components/StatsGrid';
import ChildrenSummary from './components/ChildrenSummary';
import AppointmentsSummary from './components/AppointmentsSummary';
import QuickActions from './components/QuickActions';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ childrenCount: 0, appointmentsCount: 0, predictionsCount: 0 });
  const [children, setChildren] = useState<Child[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch children
        const { data: childrenData, count: childrenCount } = await supabase
          .from('children')
          .select('*', { count: 'exact' })
          .eq('parent_id', user.id);

        // Fetch upcoming appointments
        const { data: appointmentsData, count: appointmentsCount } = await supabase
          .from('appointments')
          .select('*, doctor:profiles(first_name, last_name)', { count: 'exact' })
          .eq('parent_id', user.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true });

        // Fetch predictions count
        let predictionsCount = 0;
        if (childrenData && childrenData.length > 0) {
          const childIds = childrenData.map(c => c.id);
          const { count } = await supabase
            .from('predictions')
            .select('id', { count: 'exact', head: true })
            .in('child_id', childIds);
          predictionsCount = count || 0;
        }

        setChildren(childrenData || []);
        setAppointments(appointmentsData as Appointment[] || []);
        setStats({
          childrenCount: childrenCount || 0,
          appointmentsCount: appointmentsCount || 0,
          predictionsCount: predictionsCount,
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <WelcomeHeader name={profile?.first_name} />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChildrenSummary children={children} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      
      <AppointmentsSummary appointments={appointments} />
    </div>
  );
};

export default Dashboard;
