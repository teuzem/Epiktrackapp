import React from 'react';
import Card from '../../../components/ui/Card';
import { Banknote, Stethoscope, Star } from 'lucide-react';

interface StatsGridProps {
  stats: {
    revenue: number;
    consultations: number;
    rating: number;
  };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
  };

  const statItems = [
    {
      title: 'Revenu Total',
      value: formatCurrency(stats.revenue),
      icon: <Banknote className="w-8 h-8 text-primary-600" />,
    },
    {
      title: 'Consultations',
      value: stats.consultations,
      icon: <Stethoscope className="w-8 h-8 text-primary-600" />,
    },
    {
      title: 'Note Moyenne',
      value: `${stats.rating.toFixed(1)} / 5`,
      icon: <Star className="w-8 h-8 text-primary-600" />,
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
