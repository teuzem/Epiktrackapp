import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import { Appointment } from '../../../lib/supabase';
import { Calendar, Video, User } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UpcomingConsultationsProps {
  appointments: Appointment[];
}

const UpcomingConsultations: React.FC<UpcomingConsultationsProps> = ({ appointments }) => {
  return (
    <Card 
      title="Consultations du Jour"
      action={
        <Link to="/doctor/appointments" className="text-sm font-medium text-primary-600 hover:underline">
          Voir tout le calendrier
        </Link>
      }
    >
      {appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="Aucune consultation aujourd'hui"
          description="Profitez de votre journée ou préparez vos prochaines consultations."
        />
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {appointment.child?.first_name} {appointment.child?.last_name} 
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({differenceInYears(new Date(), new Date(appointment.child!.date_of_birth))} ans)
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(appointment.scheduled_at), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              <Link to={`/consultation/${appointment.id}`}>
                <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  <Video className="w-4 h-4 mr-2" />
                  Démarrer
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default UpcomingConsultations;
