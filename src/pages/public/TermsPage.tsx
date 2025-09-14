import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const TermsPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Conditions d'Utilisation"
      subtitle="Veuillez lire attentivement nos conditions d'utilisation avant d'utiliser les services d'EpicTrack."
    >
      <div className="prose prose-lg max-w-full text-gray-600">
        <p className="text-sm text-gray-500">Dernière mise à jour : 14 Septembre 2025</p>

        <h3>1. Acceptation des conditions</h3>
        <p>En accédant et en utilisant l'application EpicTrack ("le Service"), vous acceptez d'être lié par ces Conditions d'Utilisation et notre <a href="/privacy">Politique de Confidentialité</a>. Si vous n'êtes pas d'accord avec l'une de ces conditions, vous n'êtes pas autorisé à utiliser le Service.</p>

        <h3>2. Avertissement Médical Important</h3>
        <p>EpicTrack est un outil d'aide à la décision et de téléconsultation. <strong>Il ne remplace en aucun cas un diagnostic, un avis ou un traitement médical professionnel.</strong> Les prédictions générées par l'intelligence artificielle sont des hypothèses basées sur des données statistiques et doivent impérativement être confirmées par un médecin qualifié. <strong>En cas d'urgence médicale, contactez immédiatement les services d'urgence locaux (composez le 119 au Cameroun) et ne vous fiez pas à l'application.</strong></p>

        <h3>3. Utilisation du Service</h3>
        <p>Vous vous engagez à :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Fournir des informations exactes, actuelles et complètes lors de votre inscription et de l'utilisation du Service.</li>
          <li>Utiliser le Service à des fins personnelles et non commerciales, de manière responsable et conforme à la loi.</li>
          <li>Protéger la confidentialité de vos identifiants de connexion et être responsable de toute activité survenant sous votre compte.</li>
        </ul>

        <h3>4. Paiements et Remboursements</h3>
        <p>Les consultations avec les médecins sont des services payants. Les tarifs sont clairement indiqués avant la confirmation de tout rendez-vous. Les paiements sont traités via nos partenaires de paiement sécurisés. Les conditions de remboursement sont définies au cas par cas et dépendent de la politique d'annulation.</p>

        <h3>5. Limitation de Responsabilité</h3>
        <p>Dans toute la mesure permise par la loi, EpicTrack ne pourra être tenu responsable des dommages directs ou indirects (y compris les préjudices corporels) résultant de l'utilisation, de la mauvaise utilisation ou de l'incapacité à utiliser le Service. Votre unique recours est de cesser d'utiliser le Service.</p>

        <h3>6. Propriété Intellectuelle</h3>
        <p>Le Service et son contenu original, ses caractéristiques et ses fonctionnalités sont et resteront la propriété exclusive d'EpicTrack et de ses concédants de licence.</p>
        
        <h3>7. Modifications des Conditions</h3>
        <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Nous vous notifierons de tout changement important. La poursuite de l'utilisation du Service après de telles modifications constitue votre acceptation des nouvelles conditions.</p>
      </div>
    </StaticPageLayout>
  );
};

export default TermsPage;
