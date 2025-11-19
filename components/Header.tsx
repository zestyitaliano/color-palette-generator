
import React from 'react';
import { AppView } from '../types';
import { PaletteIcon, ImageIcon, HeartIcon, UserIcon, TrendingIcon } from './icons/Icons';

interface HeaderProps {
  activeView: AppView;
  setAppView: (view: AppView) => void;
  onToggleFavoritesPanel: () => void;
  onOpenAccount: () => void;
  isLoggedIn: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeView, setAppView, onToggleFavoritesPanel, onOpenAccount, isLoggedIn }) => {
  
  // Calculate translate value based on active view
  // We use percentage-based translation relative to the indicator's own width (which is 1/3 of container)
  let translateClass = 'translate-x-0';
  if (activeView === AppView.Image) {
      translateClass = 'translate-x-[100%]'; 
  } else if (activeView === AppView.Trending) {
      translateClass = 'translate-x-[200%]';
  }

  return (
    <header className="w-full p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <h1 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">
        Color Palette <span className="text-[#1982c4]">Generator</span>
      </h1>
      <div className="flex items-center gap-4">
        
        {/* Segmented Control - 3 Items */}
        <div className="relative flex bg-gray-100 border border-gray-200 w-[260px] sm:w-[390px] h-10 sm:h-12 shadow-inner rounded-none">
            
            {/* Sliding Indicator (1/3 width) */}
            <div 
                className={`absolute top-0 bottom-0 left-0 w-1/3 bg-[#1982c4] transition-transform duration-300 ease-out shadow-sm will-change-transform ${translateClass}`}
            />
            
            {/* Palette Segment */}
            <button
                onClick={() => setAppView(AppView.Palette)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Palette ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <PaletteIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Palette</span>
                <span className="sm:hidden">Edit</span>
            </button>
            
            {/* Brand Mockup Segment */}
            <button
                onClick={() => setAppView(AppView.Image)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Image ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Mockup</span>
                <span className="sm:hidden">View</span>
            </button>

            {/* Trending Segment */}
            <button
                onClick={() => setAppView(AppView.Trending)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors duration-300 select-none ${
                    activeView === AppView.Trending ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <TrendingIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
                <span className="sm:hidden">Trend</span>
            </button>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={onToggleFavoritesPanel} 
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-gray-500 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:text-red-500 transition-colors" 
                aria-label="View favorite palettes"
                title="Saved Palettes"
            >
                <HeartIcon />
            </button>
            <button 
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
