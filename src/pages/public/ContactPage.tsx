import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import StaticPageLayout from '../../components/layout/StaticPageLayout';
import Button from '../../components/ui/Button';

const ContactPage: React.FC = () => {
  return (
    <StaticPageLayout
      title="Contactez-nous"
      subtitle="Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans la protection de la santé de vos enfants."
      imageUrl="https://images.unsplash.com/photo-1587560699334-cc426240169f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Téléphone</h3>
              <p className="text-gray-600 mt-1">Notre ligne est ouverte du Lundi au Vendredi, de 9h à 17h.</p>
              <a href="tel:+2376XXXXXXXX" className="text-primary-600 font-medium hover:underline">+237 6XX XXX XXX</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600 mt-1">Pour toute question générale ou demande de partenariat.</p>
              <a href="mailto:contact@epictrack.cm" className="text-primary-600 font-medium hover:underline">contact@epictrack.cm</a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Adresse</h3>
              <p className="text-gray-600 mt-1">Nos bureaux sont situés au coeur de la capitale.</p>
              <p className="font-medium text-gray-800">Bastos, Yaoundé, Cameroun</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-50 p-8 rounded-xl shadow-sm"
        >
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Votre message..."
              ></textarea>
            </div>

            <Button type="submit">
              Envoyer le message
            </Button>
          </form>
        </motion.div>
      </div>
    </StaticPageLayout>
  );
};

export default ContactPage;
