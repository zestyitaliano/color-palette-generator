
import React from 'react';
import { HeartIcon } from './icons/Icons';

interface MiniPaletteCardProps {
  palette: string[];
  likes: string;
  harmony: string;
  onLoad: () => void;
}

const MiniPaletteCard: React.FC<MiniPaletteCardProps> = ({ palette, likes, harmony, onLoad }) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Color Preview Strip */}
      <div className="flex h-8 w-full">
        {palette.map((hex, i) => (
          <div key={i} className="flex-1 h-full" style={{ backgroundColor: hex }} title={hex} />
        ))}
      </div>

      {/* Info & Actions */}
      <div className="p-3 flex items-center justify-between bg-white">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <HeartIcon className="w-3 h-3 text-gray-400 fill-gray-400" />
            <span className="text-xs font-bold">{likes}</span>
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium bg-gray-50 px-1 py-0.5 rounded w-fit">
            #{harmony}
          </span>
        </div>
        
        <button 
          onClick={onLoad}
          className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wide hover:bg-[#1982c4] transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
};

export default MiniPaletteCard;
