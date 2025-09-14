import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment, DoctorProfile } from '../../lib/supabase';

import Spinner from '../../components/ui/Spinner';
import WelcomeHeader from './components/WelcomeHeader';
import StatsGrid from './components/StatsGrid';
import UpcomingConsultations from './components/UpcomingConsultations';
import RevenueChart from './components/RevenueChart';

interface DoctorStats {
  revenue: number;
  consultations: number;
  rating: number;
}

const DoctorDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DoctorStats>({ revenue: 0, consultations: 0, rating: 0 });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*, child:children(first_name, last_name, date_of_birth), parent:profiles(first_name, last_name)')
          .eq('doctor_id', user.id)
          .gte('scheduled_at', today.toISOString())
          .lt('scheduled_at', tomorrow.toISOString())
          .order('scheduled_at', { ascending: true });

        setAppointments(appointmentsData as Appointment[] || []);

        // Fetch stats
        const { data: doctorProfile } = await supabase
          .from('doctor_profiles')
          .select('rating, total_consultations')
          .eq('id', user.id)
          .single<DoctorProfile>();

        const { data: completedAppointments } = await supabase
          .from('appointments')
          .select('fee_amount, completed_at')
          .eq('doctor_id', user.id)
          .eq('status', 'completed');
        
        const totalRevenue = completedAppointments?.reduce((sum, app) => sum + (app.fee_amount || 0), 0) || 0;

        setStats({
          revenue: totalRevenue,
          consultations: doctorProfile?.total_consultations || 0,
          rating: doctorProfile?.rating || 0,
        });

        // Prepare revenue chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d;
        }).reverse();

        const chartData = last7Days.map(day => {
          const dayString = day.toISOString().split('T')[0];
          const dailyRevenue = completedAppointments
            ?.filter(app => app.completed_at && app.completed_at.startsWith(dayString))
            .reduce((sum, app) => sum + (app.fee_amount || 0), 0);
          
          return {
            name: day.toLocaleDateString('fr-FR', { weekday: 'short' }),
            revenue: dailyRevenue,
          };
        });
        setRevenueData(chartData);

      } catch (error) {
        console.error('Error fetching doctor dashboard data:', error);
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
      <WelcomeHeader name={profile?.last_name} />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UpcomingConsultations appointments={appointments} />
        </div>
        <div>
          <RevenueChart data={revenueData} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
