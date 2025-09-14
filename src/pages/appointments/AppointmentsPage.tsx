import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Video, Check, X, PlusCircle } from 'lucide-react';

import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

type Tab = 'upcoming' | 'past' | 'cancelled';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*, doctor:profiles(first_name, last_name, avatar_url), child:children(first_name, last_name)')
          .eq('parent_id', user.id)
          .order('scheduled_at', { ascending: false });

        if (error) throw error;
        setAppointments(data as Appointment[] || []);
      } catch (error) {
        toast.error("Erreur lors de la récupération des rendez-vous.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const filterAppointments = () => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter(a => new Date(a.scheduled_at) >= now && a.status === 'confirmed');
      case 'past':
        return appointments.filter(a => new Date(a.scheduled_at) < now && a.status === 'completed');
      case 'cancelled':
        return appointments.filter(a => a.status === 'cancelled');
      default:
        return [];
    }
  };

  const filteredAppointments = filterAppointments();

  const renderStatusBadge = (status: Appointment['status']) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const text = {
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      pending: 'En attente',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
  };

  const AppointmentItem = ({ appointment }: { appointment: Appointment }) => (
    <Card className="!p-0 overflow-hidden">
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}</h3>
          <p className="text-sm text-gray-500">Consultation pour {appointment.child?.first_name}</p>
          <p className="text-sm text-gray-500 capitalize">{format(new Date(appointment.scheduled_at), "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
        </div>
        {renderStatusBadge(appointment.status)}
      </div>
      {activeTab === 'upcoming' && (
        <div className="p-4 bg-gray-50 border-t">
          <Link to={`/consultation/${appointment.id}`}>
            <Button className="w-full">
              <Video className="mr-2 h-5 w-5" />
              Rejoindre la consultation
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
        <Link to="/appointments/new">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Nouveau Rendez-vous
          </Button>
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('upcoming')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upcoming' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>À venir</button>
          <button onClick={() => setActiveTab('past')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Passés</button>
          <button onClick={() => setActiveTab('cancelled')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cancelled' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Annulés</button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-10 h-10" />}
          title={`Aucun rendez-vous ${activeTab === 'upcoming' ? 'à venir' : activeTab === 'past' ? 'passé' : 'annulé'}`}
          description="Vous n'avez pas de rendez-vous dans cette catégorie."
        />
      ) : (
        <div className="space-y-6">
          {filteredAppointments.map(app => <AppointmentItem key={app.id} appointment={app} />)}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
