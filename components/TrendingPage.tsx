
import React, { useState, useRef } from 'react';
import MiniPaletteCard from './MiniPaletteCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface TrendingPageProps {
  onLoadPalette: (palette: string[]) => void;
}

// Mock Data - Base set
const BASE_PALETTES = [
  { colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'], likes: '12.5K', harmony: 'Nature' },
  { colors: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'], likes: '8.2K', harmony: 'Pastel' },
  { colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'], likes: '6.1K', harmony: 'Retro' },
  { colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'], likes: '5.9K', harmony: 'Earthy' },
  { colors: ['#000000', '#14213d', '#fca311', '#e5e5e5', '#ffffff'], likes: '4.3K', harmony: 'Bold' },
  { colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'], likes: '3.8K', harmony: 'Ocean' },
  { colors: ['#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41'], likes: '3.1K', harmony: 'Forest' },
  { colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'], likes: '2.9K', harmony: 'Vibrant' },
  { colors: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d'], likes: '2.4K', harmony: 'Warm' },
  { colors: ['#5f0f40', '#9a031e', '#fb8b24', '#e36414', '#0f4c5c'], likes: '1.9K', harmony: 'Deep' },
  { colors: ['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4'], likes: '1.5K', harmony: 'Muted' },
  { colors: ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d', '#6d6875'], likes: '1.2K', harmony: 'Rose' },
];

// Generate 60 items for pagination demo by cycling through base palettes
const TRENDING_PALETTES = Array.from({ length: 60 }).map((_, i) => {
    const base = BASE_PALETTES[i % BASE_PALETTES.length];
    // Randomize likes slightly to make them look unique
    const randomLikes = (parseFloat(base.likes) + (Math.random() * 2 - 1)).toFixed(1);
    return {
        ...base,
        likes: `${randomLikes}K`,
        id: i
    };
});

const ITEMS_PER_PAGE = 12;

const TrendingPage: React.FC<TrendingPageProps> = ({ onLoadPalette }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(TRENDING_PALETTES.length / ITEMS_PER_PAGE);

  const currentItems = TRENDING_PALETTES.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      // Scroll to top of grid when page changes
      if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div ref={containerRef} className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-full">
      <div className="max-w-7xl mx-auto flex flex-col min-h-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Palettes</h2>
          <p className="text-gray-500">Explore popular color combinations curated by the community.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
          {currentItems.map((item, index) => (
            <MiniPaletteCard 
              key={item.id}
              palette={item.colors}
              likes={item.likes}
              harmony={item.harmony}
              onLoad={() => onLoadPalette(item.colors)}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 mb-4">
                <button 
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum 
                                    ? 'bg-[#1982c4] text-white shadow-md scale-110' 
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button 
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-gray-600"
                    aria-label="Next page"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
