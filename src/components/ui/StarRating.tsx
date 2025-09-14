import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 5, className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            onClick={() => setRating && setRating(ratingValue)}
            className={`transition-colors duration-200 ${setRating ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!setRating}
          >
            <Star
              className={`transition-all duration-200 ${
                ratingValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
              style={{ width: size, height: size }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
