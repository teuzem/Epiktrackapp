import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Video, FileText, Shield, MessageCircle, TrendingUp, CheckCircle, Stethoscope, UserCheck } from 'lucide-react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  const features = [
    { icon: Brain, title: 'Prédiction IA Avancée', description: 'Notre intelligence artificielle analyse plus de 20 maladies infantiles courantes au Cameroun avec une précision de 95%.' },
    { icon: Video, title: 'Consultations Vidéo', description: 'Consultez directement des médecins spécialisés vérifiés par le MINSANTE via vidéoconférence sécurisée.' },
    { icon: FileText, title: 'Rapports Médicaux Détaillés', description: 'Recevez des rapports détaillés incluant diagnostic, traitement et recommandations personnalisées.' },
    { icon: Shield, title: 'Sécurité et Confidentialité', description: 'Plateforme sécurisée conforme aux normes de protection des données médicales du Cameroun.' },
    { icon: MessageCircle, title: 'Chat Médical Sécurisé', description: 'Échangez en temps réel avec les professionnels de santé via notre messagerie chiffrée.' },
    { icon: TrendingUp, title: 'Suivi de Croissance Intelligent', description: 'Suivez l\'évolution de la santé de vos enfants avec des courbes de croissance et des analyses personnalisées.' }
  ];

  const howItWorks = [
    { icon: UserCheck, title: 'Créez un profil pour votre enfant', description: 'Ajoutez les informations de base de votre enfant pour un suivi personnalisé.' },
    { icon: Stethoscope, title: 'Décrivez les symptômes', description: 'Utilisez notre formulaire guidé pour renseigner les symptômes observés.' },
    { icon: Brain, title: 'Recevez une prédiction IA', description: 'Notre IA analyse les données et fournit une hypothèse diagnostique en quelques secondes.' },
    { icon: Video, title: 'Consultez un médecin', description: 'Confirmez le diagnostic et obtenez une prescription via une téléconsultation.' },
  ];

  return (
    <StaticPageLayout
      title="Fonctionnalités Révolutionnaires"
      subtitle="Découvrez comment EpicTrack transforme les soins de santé infantile grâce à des technologies de pointe adaptées au contexte local."
      imageUrl="https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
    >
      <div className="space-y-20">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-5">
                <feature.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Comment ça marche ?</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {howItWorks.map((step, i) => (
                <motion.div key={step.title} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: i * 0.15 }}>
                  <div className="p-6 bg-white rounded-xl text-center">
                    <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à prendre le contrôle de la santé de vos enfants ?</h2>
          <p className="max-w-xl mx-auto mb-8">Rejoignez des milliers de familles camerounaises qui nous font confiance.</p>
          <Link to="/register">
            <Button className="!bg-white !text-primary-600 hover:!bg-gray-100 px-8 py-3">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default FeaturesPage;
