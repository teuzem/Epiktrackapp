import React from 'react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const LegalPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Mentions Légales"
      subtitle="Informations légales concernant l'éditeur et l'hébergeur du site EpicTrack."
    >
      <div className="prose prose-lg max-w-full text-gray-600">
        <p className="lead">Conformément aux dispositions de la loi pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site EpicTrack l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.</p>

        <h2>Édition du site</h2>
        <p>Le présent site, accessible à l’URL <strong>https://epictrack.cm</strong>, est édité par :</p>
        <p><strong>EpicTrack Cameroun</strong>, société [Forme juridique de la société] au capital de [Montant du capital social] euros, inscrite au R.C.S. de [Ville d’immatriculation] sous le numéro [Numéro d’immatriculation], dont le siège social est situé à [Adresse du siège social].</p>
        <p>Numéro de téléphone : +237 6XX XXX XXX</p>
        <p>Adresse e-mail : <a href="mailto:contact@epictrack.cm">contact@epictrack.cm</a></p>
        
        <h2>Hébergement</h2>
        <p>Le Site est hébergé par la société [Nom de l'hébergeur], situé [Adresse de l'hébergeur], (contact téléphonique ou email : [Contact de l'hébergeur]).</p>

        <h2>Directeur de publication</h2>
        <p>Le Directeur de la publication du Site est [Nom du directeur de publication].</p>

        <h2>Nous contacter</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Par téléphone :</strong> +237 6XX XXX XXX</li>
          <li><strong>Par email :</strong> <a href="mailto:contact@epictrack.cm">contact@epictrack.cm</a></li>
          <li><strong>Par courrier :</strong> [Adresse postale]</li>
        </ul>

        <h2>Données personnelles</h2>
        <p>Le traitement de vos données à caractère personnel est régi par notre <a href="/privacy">Politique de Confidentialité</a> conformément au Règlement Général sur la Protection des Données 2016/679 du 27 avril 2016 (« RGPD »).</p>
      </div>
    </StaticPageLayout>
  );
};

export default LegalPage;
