import React from 'react';
import { motion } from 'framer-motion';

interface StaticPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  imageUrl?: string;
}

const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ title, subtitle, children, imageUrl }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-primary-50 py-20 md:py-28">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'})` }}
        ></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>
    </div>
  );
};

export default StaticPageLayout;
