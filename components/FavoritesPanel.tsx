
import React from 'react';
import { TrashIcon, XIcon } from './icons/Icons';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  palettes: string[][];
  onSelect: (palette: string[]) => void;
  onDelete: (palette: string[]) => void;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ isOpen, onClose, palettes, onSelect, onDelete }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Favorite Palettes</h2>
            <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Close favorites panel">
                <XIcon />
            </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
            {palettes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>No palettes saved yet.</p>
                    <p className="text-sm">Click the heart icon to save a palette.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {palettes.map((p, i) => (
                        <li key={i} className="group flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all">
                            <div className="flex-grow flex h-12 overflow-hidden cursor-pointer shadow-sm" onClick={() => onSelect(p)} title="Click to load this palette">
                                {p.map(hex => <div key={hex} className="flex-1 transition-all duration-300 ease-in-out group-hover:flex-grow-[1.2]" style={{ backgroundColor: hex }} />)}
                            </div>
                            <button type="button" onClick={() => onDelete(p)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" aria-label="Delete palette">
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </aside>
    </>
  );
};

export default FavoritesPanel;
