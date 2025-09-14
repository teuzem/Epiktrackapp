import React from 'react';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
  const getStrength = () => {
    let score = 0;
    if (!password) return 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return score;
  };

  const strength = getStrength();

  const strengthLevels = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Très faible', color: 'bg-red-500' },
    { label: 'Faible', color: 'bg-orange-500' },
    { label: 'Moyen', color: 'bg-yellow-500' },
    { label: 'Fort', color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < strength ? strengthLevels[strength].color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs mt-1 font-medium`} style={{ color: strengthLevels[strength].color.replace('bg-', '') }}>
          {strengthLevels[strength].label}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
