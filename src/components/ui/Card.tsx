import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}>
      {(title || action) && (
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
