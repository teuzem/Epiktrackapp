import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const PrivacyPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Politique de Confidentialité"
      subtitle="Votre vie privée est notre priorité. Découvrez comment nous protégeons vos données."
    >
      <div className="prose prose-lg max-w-full text-gray-600">
        <p className="text-sm text-gray-500">Dernière mise à jour : 14 Septembre 2025</p>
        
        <p className="lead">Bienvenue sur EpicTrack. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application. Nous nous engageons à protéger la confidentialité de vos données de santé et de celles de vos enfants.</p>

        <h3>1. Collecte des informations</h3>
        <p>Nous collectons les informations que vous nous fournissez directement, telles que :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Informations de compte :</strong> nom, email, mot de passe, rôle (parent ou médecin).</li>
          <li><strong>Informations de profil :</strong> numéro de téléphone, date de naissance, localisation, photo de profil.</li>
          <li><strong>Informations sur les enfants :</strong> nom, date de naissance, sexe, et autres données de santé que vous choisissez de fournir (groupe sanguin, allergies, etc.).</li>
          <li><strong>Données de santé :</strong> symptômes, historique médical, rapports de prédiction, et informations échangées lors des consultations. Ces données sont chiffrées et traitées avec le plus haut niveau de sécurité.</li>
        </ul>

        <h3>2. Utilisation des informations</h3>
        <p>Nous utilisons vos informations pour :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Fournir, maintenir et améliorer nos services, y compris la précision de notre modèle d'IA.</li>
          <li>Faciliter les consultations sécurisées entre parents et médecins.</li>
          <li>Communiquer avec vous concernant votre compte ou nos services.</li>
          <li>Garantir la sécurité et l'intégrité de notre plateforme.</li>
        </ul>

        <h3>3. Partage des informations</h3>
        <p>Nous ne vendons ni ne louons vos informations personnelles. Le partage est strictement limité aux cas suivants :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Avec les médecins :</strong> Uniquement lorsque vous initiez une consultation, le médecin concerné a accès aux informations pertinentes de l'enfant.</li>
          <li><strong>Pour des raisons légales :</strong> Si la loi l'exige ou pour répondre à une procédure judiciaire valide.</li>
          <li><strong>Données anonymisées :</strong> Nous pouvons utiliser des données agrégées et anonymisées à des fins de recherche pour améliorer la santé publique, sans jamais révéler votre identité.</li>
        </ul>

        <h3>4. Sécurité des données</h3>
        <p>La sécurité de vos données est notre priorité absolue. Nous mettons en œuvre des mesures de sécurité robustes, telles que le chiffrement de bout en bout pour les messages, le stockage sécurisé des données sur des serveurs conformes aux normes de santé, et des contrôles d'accès stricts pour empêcher tout accès non autorisé.</p>

        <h3>5. Vos droits</h3>
        <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Vous pouvez exercer ces droits directement depuis les paramètres de votre compte ou en nous contactant à <a href="mailto:privacy@epictrack.cm">privacy@epictrack.cm</a>.</p>
      </div>
    </StaticPageLayout>
  );
};

export default PrivacyPage;
