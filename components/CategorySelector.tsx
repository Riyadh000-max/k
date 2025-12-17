import React from 'react';
import { Category } from '../types';
import { CATEGORIES } from '../constants';

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
  onCustomSelect: (topic: string) => void;
  isLoading: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect, onCustomSelect, isLoading }) => {
  const [customTopic, setCustomTopic] = React.useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onCustomSelect(customTopic);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <h2 className="text-3xl md:text-5xl font-bold text-center text-blue-600 mb-8 drop-shadow-sm">
        What do you want to learn?
      </h2>
      
      {/* Predefined Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            disabled={isLoading}
            className={`${cat.color} hover:opacity-90 active:scale-95 transition-all duration-200 
              text-white p-6 rounded-3xl shadow-lg border-b-8 border-black/10
              flex flex-col items-center justify-center gap-2 group h-40 md:h-48`}
          >
            <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
              {cat.icon}
            </span>
            <span className="text-xl md:text-2xl font-bold tracking-wide uppercase">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Custom Topic Input */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-yellow-300">
        <form onSubmit={handleCustomSubmit} className="flex flex-col md:flex-row gap-4 items-center">
          <label className="text-xl font-bold text-gray-500 whitespace-nowrap">✨ Or try something else:</label>
          <input 
            type="text" 
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. Dinosaurs, Robots, Candy..."
            disabled={isLoading}
            className="w-full md:flex-1 p-4 rounded-2xl bg-gray-100 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none text-xl font-bold text-gray-700 placeholder-gray-400 transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading || !customTopic.trim()}
            className="w-full md:w-auto px-8 py-4 bg-purple-500 text-white font-bold rounded-2xl shadow-md border-b-4 border-purple-700 hover:bg-purple-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            GO! 🚀
          </button>
        </form>
      </div>
    </div>
  );
};
