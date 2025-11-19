import React from 'react';
import { Color } from '../types';
import tinycolor from 'tinycolor2';
import { XIcon, CopyIcon } from './icons/Icons';

interface ColorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: Color | null;
}

const ColorDetailsModal: React.FC<ColorDetailsModalProps> = ({ isOpen, onClose, color }) => {
  if (!isOpen || !color) return null;

  const isDark = tinycolor(color.hex).isDark();
  const textColor = isDark ? 'text-white' : 'text-gray-900';

  const handleCopy = () => {
      navigator.clipboard.writeText(color.hex);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-2xl z-50 rounded-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header / Color Preview */}
        <div className="relative h-32 w-full flex items-end p-6" style={{ backgroundColor: color.hex }}>
            <button 
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors ${isDark ? 'text-white' : 'text-black'}`}
            >
                <XIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
                <h2 className={`text-3xl font-mono font-bold ${textColor}`}>{color.hex}</h2>
                <p className={`text-sm opacity-80 capitalize ${textColor}`}>{tinycolor(color.hex).toName() || 'Custom Color'}</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
            
            {/* Values */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <span className="text-xs text-gray-500 uppercase font-bold">RGB</span>
                    <p className="font-mono text-sm text-gray-900 mt-1">{color.rgb}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                    <span className="text-xs text-gray-500 uppercase font-bold">Display P3</span>
                    <p className="font-mono text-sm text-gray-900 mt-1 truncate" title={color.p3}>{color.p3}</p>
                </div>
            </div>

            {/* Contrast */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">WCAG Contrast</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <span className="text-sm text-gray-600">vs White</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{color.wcagWhite.toFixed(2)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${color.wcagWhiteCompliant ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                {color.wcagWhiteCompliant ? 'AA' : 'Fail'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <span className="text-sm text-gray-600">vs Black</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">{color.wcagBlack.toFixed(2)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${color.wcagBlackCompliant ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                {color.wcagBlackCompliant ? 'AA' : 'Fail'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

             {/* Action */}
             <button 
                onClick={handleCopy}
                className="w-full py-3 flex items-center justify-center gap-2 bg-[#1982c4] text-white font-bold rounded hover:bg-[#156fba] transition-colors"
             >
                 <CopyIcon className="w-5 h-5" />
                 <span>Copy Hex Code</span>
             </button>
        </div>
      </div>
    </>
  );
};

export default ColorDetailsModal;