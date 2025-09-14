import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="w-full lg:grid lg:grid-cols-2 py-12">
      <div className="relative hidden items-center justify-center text-white lg:flex flex-col p-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 rounded-2xl"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618498082410-b4aa22193b38?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')" }}
        >
          <div className="absolute inset-0 bg-gray-900 opacity-60 rounded-2xl"></div>
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold leading-tight">La santé de vos enfants, notre priorité.</h1>
            <p className="mt-4 text-xl text-gray-300">
              Prédisez, consultez, et suivez la santé infantile avec une précision inégalée au Cameroun.
            </p>
          </motion.div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
