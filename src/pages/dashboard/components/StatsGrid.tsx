import React from 'react';
import Card from '../../../components/ui/Card';
import { Heart, Calendar, BrainCircuit } from 'lucide-react';

interface StatsGridProps {
  stats: {
    childrenCount: number;
    appointmentsCount: number;
    predictionsCount: number;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statItems = [
    {
      title: 'Enfants Enregistrés',
      value: stats.childrenCount,
      icon: <Heart className="w-8 h-8 text-primary-600" />,
    },
    {
      title: 'Rendez-vous à venir',
      value: stats.appointmentsCount,
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
    },
    {
      title: 'Prédictions Faites',
      value: stats.predictionsCount,
      icon: <BrainCircuit className="w-8 h-8 text-primary-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <Card key={index} className="flex items-center p-6">
          <div className="mr-6">{item.icon}</div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm font-medium text-gray-500">{item.title}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
