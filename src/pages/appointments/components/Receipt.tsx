import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart } from 'lucide-react';

const Receipt: React.FC<{ data: any }> = ({ data }) => {
  const { appointment, parent, payment } = data;

  return (
    <div className="p-8 bg-white font-sans text-sm">
      <header className="flex justify-between items-center pb-4 border-b-2">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center"><Heart className="w-7 h-7 text-white" /></div>
          <h1 className="text-2xl font-bold">EpicTrack</h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">REÇU DE PAIEMENT</h2>
          <p>#{payment.reference}</p>
        </div>
      </header>

      <section className="mt-8">
        <p className="mb-4">Ceci confirme la réception du paiement de <strong>{parent.first_name} {parent.last_name}</strong>.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Montant Payé:</strong></p>
            <p className="text-right font-bold text-lg">{new Intl.NumberFormat('fr-CM').format(data.amount)} FCFA</p>
            
            <p><strong>Date de Paiement:</strong></p>
            <p className="text-right">{format(new Date(payment.paid_at), 'd MMMM yyyy, HH:mm', { locale: fr })}</p>

            <p><strong>Méthode de Paiement:</strong></p>
            <p className="text-right capitalize">{payment.payment_provider}</p>

            <p><strong>Pour Service:</strong></p>
            <p className="text-right">Consultation Vidéo</p>
          </div>
        </div>
      </section>

      <section className="mt-8 text-center">
        <p className="text-2xl font-bold text-green-600">PAIEMENT CONFIRMÉ</p>
      </section>

      <footer className="mt-12 pt-4 border-t text-xs text-center text-gray-500">
        <p>Votre rendez-vous est confirmé. Merci d'utiliser EpicTrack.</p>
        <p>EpicTrack Cameroun - Yaoundé</p>
      </footer>
    </div>
  );
};

export default Receipt;
