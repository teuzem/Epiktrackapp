import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Appointment } from '../../../lib/supabase';
import { Calendar, Video, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentsSummaryProps {
  appointments: Appointment[];
}

const AppointmentsSummary: React.FC<AppointmentsSummaryProps> = ({ appointments }) => {
  return (
    <Card 
      title="Rendez-vous à venir"
      action={
        <Link to="/appointments" className="text-sm font-medium text-primary-600 hover:underline">
          Voir tout
        </Link>
      }
    >
      {appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="Aucun rendez-vous programmé"
          description="Vous n'avez pas de consultations à venir."
          action={
            <Link to="/prediction/start">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                <PlusCircle className="w-4 h-4 mr-2" />
                Démarrer une prédiction
              </button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {appointments.slice(0, 3).map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                  <Video className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {format(new Date(appointment.scheduled_at), "eeee d MMMM 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              <Link to={`/consultation/${appointment.id}`}>
                <button className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  Rejoindre
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AppointmentsSummary;
