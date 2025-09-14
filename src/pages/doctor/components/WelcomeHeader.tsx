import React from 'react';

interface WelcomeHeaderProps {
  name?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ name }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        {getGreeting()}, Dr. {name || ''}
      </h1>
      <p className="mt-1 text-gray-600">
        Voici votre résumé d'activité pour aujourd'hui.
      </p>
    </div>
  );
};

export default WelcomeHeader;
