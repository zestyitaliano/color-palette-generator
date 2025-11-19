
import React from 'react';
import { AppView } from '../types';
import { PaletteIcon, ImageIcon, HeartIcon, UserIcon, TrendingIcon, GradientIcon, RecolorIcon } from './icons/Icons';

interface HeaderProps {
  activeView: AppView;
  setAppView: (view: AppView) => void;
  onToggleFavoritesPanel: () => void;
  onOpenAccount: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeView, setAppView, onToggleFavoritesPanel, onOpenAccount, isLoggedIn }) => {
  
  // Calculate translate value based on active view
  // We use percentage-based translation relative to the indicator's own width (which is 1/5 of container now)
  let translateClass = 'translate-x-0';
  if (activeView === AppView.Image) {
      translateClass = 'translate-x-[100%]'; 
  } else if (activeView === AppView.Trending) {
      translateClass = 'translate-x-[200%]';
  } else if (activeView === AppView.Gradients) {
      translateClass = 'translate-x-[300%]';
  } else if (activeView === AppView.ImageRecolor) {
      translateClass = 'translate-x-[400%]';
  }

  return (
    <header className="w-full p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <h1 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">
        Color Palette <span className="text-[#1982c4]">Generator</span>
      </h1>
      <div className="flex items-center gap-4">
        
        {/* Segmented Control - 5 Items */}
        <div className="relative flex bg-gray-100 border border-gray-200 w-[360px] sm:w-[600px] h-10 sm:h-12 shadow-inner rounded-none">
            
            {/* Sliding Indicator (1/5 width) */}
            <div 
                className={`absolute top-0 bottom-0 left-0 w-[20%] bg-[#1982c4] transition-transform duration-300 ease-out shadow-sm will-change-transform ${translateClass}`}
            />
            
            {/* Palette Segment */}
            <button
                type="button"
                onClick={() => setAppView(AppView.Palette)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Palette ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <PaletteIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Palette</span>
                <span className="sm:hidden">Edit</span>
            </button>
            
            {/* Visualizer Segment */}
            <button
                type="button"
                onClick={() => setAppView(AppView.Image)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Image ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Visualizer</span>
                <span className="sm:hidden">Viz</span>
            </button>

            {/* Trending Segment */}
            <button
                type="button"
                onClick={() => setAppView(AppView.Trending)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Trending ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <TrendingIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
                <span className="sm:hidden">Trend</span>
            </button>

             {/* Gradients Segment */}
             <button
                type="button"
                onClick={() => setAppView(AppView.Gradients)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Gradients ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <GradientIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Gradients</span>
                <span className="sm:hidden">Grad</span>
            </button>

            {/* Recolor Segment */}
            <button
                type="button"
                onClick={() => setAppView(AppView.ImageRecolor)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.ImageRecolor ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <RecolorIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Recolor</span>
                <span className="sm:hidden">Color</span>
            </button>
        </div>

        <div className="flex gap-2">
            <button 
                type="button"
                onClick={onToggleFavoritesPanel} 
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:text-red-500 transition-colors" 
                aria-label="View favorite palettes"
                title="Saved Palettes"
            >
                <HeartIcon />
            </button>
            <button 
                type="button"
                onClick={onOpenAccount} 
                className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors ${isLoggedIn ? 'text-[#1982c4]' : 'text-gray-500 hover:text-[#1982c4]'}`} 
                aria-label="Account settings"
                title="Account"
            >
                <UserIcon />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
