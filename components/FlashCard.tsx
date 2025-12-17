import React, { useEffect, useState, useRef } from 'react';
import { VocabularyItem } from '../types';
import { generateImageForWord, generateSpeech, playAudioBuffer } from '../services/geminiService';
import { Volume2, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface FlashCardProps {
  item: VocabularyItem;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  total: number;
  current: number;
}

export const FlashCard: React.FC<FlashCardProps> = ({ item, isActive, onNext, onPrev, total, current }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use refs to prevent async operations from updating state if component unmounted or changed
  const mountedRef = useRef(true);
  const itemRef = useRef(item);

  useEffect(() => {
    mountedRef.current = true;
    itemRef.current = item;
    
    // Reset state when item changes
    setImageUrl(null);
    setAudioBuffer(null);
    
    // Auto-fetch assets
    fetchAssets();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.word]);

  const fetchAssets = async () => {
    // 1. Generate Image
    if (!imageUrl) {
      setIsGeneratingImage(true);
      try {
        const img = await generateImageForWord(item.word);
        if (mountedRef.current && itemRef.current.word === item.word) {
          setImageUrl(img);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mountedRef.current && itemRef.current.word === item.word) setIsGeneratingImage(false);
      }
    }

    // 2. Generate Audio (Silent pre-fetch)
    if (!audioBuffer) {
      setIsGeneratingAudio(true);
      try {
        const audio = await generateSpeech(`${item.word}. ${item.definition}`);
        if (mountedRef.current && itemRef.current.word === item.word) {
          setAudioBuffer(audio);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mountedRef.current && itemRef.current.word === item.word) setIsGeneratingAudio(false);
      }
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      if (audioBuffer) {
        playAudioBuffer(audioBuffer);
      } else {
        // Fallback: Generate on demand if prefetch failed or hasn't finished
        setIsGeneratingAudio(true);
        const audio = await generateSpeech(`${item.word}. ${item.definition}`);
        if (audio) {
          setAudioBuffer(audio);
          playAudioBuffer(audio);
        }
        setIsGeneratingAudio(false);
      }
    } catch (e) {
      console.error(e);
    }
    
    // Simple timeout to reset playing state visually
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 animate-fade-in-up">
      {/* Card Container */}
      <div className="relative w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white ring-4 ring-yellow-300">
        
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gray-100">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>

        {/* Image Area */}
        <div className="relative w-full h-80 md:h-96 bg-blue-50 flex items-center justify-center p-6 overflow-hidden">
          {isGeneratingImage ? (
            <div className="flex flex-col items-center gap-4 text-blue-400 animate-pulse">
              <Sparkles size={48} className="animate-spin-slow" />
              <span className="font-bold text-lg">Painting a picture...</span>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item.word} 
              className="w-full h-full object-contain drop-shadow-lg animate-scale-in"
            />
          ) : (
            <div className="text-9xl animate-bounce drop-shadow-lg filter grayscale opacity-50">
              {item.emoji}
            </div>
          )}
          
          {/* Retry Image Button (Bottom Right of Image) */}
          {imageUrl && (
            <button 
              onClick={() => { setImageUrl(null); fetchAssets(); }}
              className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full text-gray-500 hover:text-blue-500 transition"
              title="Regenerate Image"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-8 text-center bg-white relative">
          
          {/* Word */}
          <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-4 tracking-tight">
            {item.word}
          </h2>
          
          {/* Definition */}
          <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed mb-8">
            {item.definition}
          </p>

          {/* Action Button: Play Audio */}
          <button
            onClick={handlePlayAudio}
            disabled={isGeneratingAudio}
            className={`
              relative overflow-hidden
              mx-auto flex items-center justify-center gap-3 px-10 py-5 rounded-full
              text-2xl font-bold text-white transition-all transform
              ${isGeneratingAudio 
                ? 'bg-gray-300 cursor-wait' 
                : 'bg-green-500 hover:bg-green-600 shadow-[0_6px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[6px]'
              }
            `}
          >
            {isGeneratingAudio ? (
               <RefreshCw className="animate-spin" />
            ) : (
               <Volume2 size={32} className={isPlaying ? 'animate-pulse' : ''} />
            )}
            <span>{isGeneratingAudio ? 'Loading...' : 'Hear It!'}</span>
          </button>

        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between w-full max-w-md mt-8 gap-4">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="flex-1 bg-white text-blue-500 font-bold py-4 rounded-2xl shadow-md border-b-4 border-gray-200 disabled:opacity-50 disabled:border-transparent flex justify-center items-center hover:bg-blue-50 active:scale-95 transition-all"
        >
          <ChevronLeft size={32} />
          <span className="ml-2 text-xl">Prev</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-md border-b-4 border-blue-700 disabled:opacity-50 disabled:border-transparent flex justify-center items-center hover:bg-blue-600 active:border-b-0 active:translate-y-1 transition-all"
        >
          <span className="mr-2 text-xl">Next</span>
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: total }).map((_, idx) => (
          <div 
            key={idx}
            className={`w-3 h-3 rounded-full transition-all ${idx === current ? 'bg-blue-500 scale-125' : 'bg-blue-200'}`}
          />
        ))}
      </div>
    </div>
  );
};
