import React, { useState, useEffect } from 'react';
import Spinner from '../../../components/ui/Spinner';

const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY;

interface GiphyPickerProps {
  onSelect: (url: string) => void;
}

const GiphyPicker: React.FC<GiphyPickerProps> = ({ onSelect }) => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchGifs = async () => {
      setLoading(true);
      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${query}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${giphyApiKey}&limit=20`;
      
      try {
        const res = await fetch(endpoint);
        const { data } = await res.json();
        setGifs(data);
      } catch (error) {
        console.error("Failed to fetch GIFs", error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchGifs();
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="absolute bottom-14 left-0 w-full h-64 bg-white border rounded-lg shadow-lg p-2 flex flex-col">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher des GIFs..."
        className="w-full px-3 py-1.5 border-b mb-2 focus:outline-none"
      />
      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Spinner /></div>
      ) : (
        <div className="flex-1 grid grid-cols-4 gap-2 overflow-y-auto">
          {gifs.map(gif => (
            <img
              key={gif.id}
              src={gif.images.fixed_height.url}
              alt={gif.title}
              onClick={() => onSelect(gif.images.original.url)}
              className="w-full h-full object-cover cursor-pointer rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GiphyPicker;
