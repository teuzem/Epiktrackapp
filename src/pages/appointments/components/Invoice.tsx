import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart } from 'lucide-react';

const Invoice: React.FC<{ data: any }> = ({ data }) => {
  const { appointment, parent, payment, issued_at } = data;
  const doctor = appointment.doctor;
  const child = appointment.child;

  return (
    <div className="p-8 bg-white font-sans text-sm">
      <header className="flex justify-between items-center pb-4 border-b-2">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center"><Heart className="w-7 h-7 text-white" /></div>
          <h1 className="text-2xl font-bold">EpicTrack</h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">FACTURE</h2>
          <p>#{data.id.substring(0, 8)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="font-bold mb-2">Facturé à :</h3>
          <p>{parent.first_name} {parent.last_name}</p>
          <p>{parent.email}</p>
        </div>
        <div className="text-right">
          <p><strong>Date de facturation:</strong> {format(new Date(issued_at), 'd MMM yyyy', { locale: fr })}</p>
          <p><strong>Date d'échéance:</strong> Payé</p>
        </div>
      </section>

      <section className="mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 font-bold">Description</th>
              <th className="p-2 font-bold text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">
                <p>Consultation vidéo pour {child.first_name} {child.last_name}</p>
                <p className="text-xs text-gray-500">Avec Dr. {doctor.first_name} {doctor.last_name} le {format(new Date(appointment.scheduled_at), 'd/MM/yy HH:mm', { locale: fr })}</p>
              </td>
              <td className="p-2 border-b text-right">{new Intl.NumberFormat('fr-CM').format(data.amount)} FCFA</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-8 text-right">
        <p><strong>Total:</strong> {new Intl.NumberFormat('fr-CM').format(data.amount)} FCFA</p>
        <p className="text-lg font-bold mt-2">Montant Dû: 0 FCFA</p>
      </section>

      <footer className="mt-12 pt-4 border-t text-xs text-center text-gray-500">
        <p>Merci pour votre confiance.</p>
        <p>EpicTrack Cameroun - Yaoundé</p>
      </footer>
    </div>
  );
};

export default Invoice;
