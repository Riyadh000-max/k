import React, { useState } from 'react';
import { CategorySelector } from './components/CategorySelector';
import { FlashCard } from './components/FlashCard';
import { generateVocabularyList } from './services/geminiService';
import { VocabularyItem, AppState, Category } from './types';
import { Home, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('');

  const handleCategorySelect = async (category: Category) => {
    startLearning(category.prompt, category.name);
  };

  const handleCustomSelect = async (topic: string) => {
    startLearning(`5 vocabulary words about ${topic} for kids`, topic);
  };

  const startLearning = async (prompt: string, topicName: string) => {
    setIsLoading(true);
    setCurrentTopic(topicName);
    setVocabList([]);
    setCurrentIndex(0);

    try {
      const list = await generateVocabularyList(prompt);
      setVocabList(list);
      setAppState(AppState.LEARNING);
    } catch (error) {
      console.error("Failed to start learning:", error);
      alert("Oops! Something went wrong trying to get the words. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setAppState(AppState.HOME);
    setVocabList([]);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100 text-gray-800 flex flex-col font-sans">
      
      {/* Header */}
      <header className="p-4 bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-yellow-200/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={handleGoHome}
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="bg-blue-500 text-white p-2 rounded-xl shadow-sm">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
              TinyWords
            </h1>
          </div>
          
          {appState === AppState.LEARNING && (
            <button 
              onClick={handleGoHome}
              className="bg-white p-2 md:px-4 md:py-2 rounded-xl border-2 border-gray-100 hover:bg-gray-50 hover:border-blue-200 transition-colors flex items-center gap-2 text-gray-600 font-bold text-sm md:text-base"
            >
              <Home size={20} />
              <span className="hidden md:inline">Go Home</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        
        {/* Loading Screen */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center mt-20 animate-fade-in">
             <div className="relative">
                <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🤖
                </div>
             </div>
             <h3 className="mt-8 text-2xl font-bold text-blue-600">Making magic happens...</h3>
             <p className="text-gray-500 mt-2">Asking the AI for cool words about {currentTopic}!</p>
          </div>
        )}

        {/* Home Screen */}
        {!isLoading && appState === AppState.HOME && (
          <CategorySelector 
            onSelect={handleCategorySelect} 
            onCustomSelect={handleCustomSelect}
            isLoading={isLoading} 
          />
        )}

        {/* Learning Screen */}
        {!isLoading && appState === AppState.LEARNING && vocabList.length > 0 && (
          <FlashCard 
            item={vocabList[currentIndex]}
            isActive={true}
            onNext={handleNext}
            onPrev={handlePrev}
            total={vocabList.length}
            current={currentIndex}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-blue-800/40 text-sm font-medium">
        Powered by Gemini AI ✦ Built for Kids
      </footer>
    </div>
  );
};

export default App;
