import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Color } from '../types';
import ColorSwatch from './ColorSwatch';
import HarmonyVisualizer from './HarmonyVisualizer';
import ColorWheel from './ColorWheel';
import ColorDetailsModal from './ColorDetailsModal';
import { HeartIcon, UploadCloudIcon, DownloadIcon, UndoIcon, RedoIcon, ChevronDownIcon, InfoIcon, LockIcon, ColorPickerIcon } from './icons/Icons';
import { exportAsJson, exportAsSvg, exportAsPdf, exportAsHtml } from '../utils/exportUtils';
import { HARMONY_RULES } from '../utils/colorUtils';
import tinycolor from 'tinycolor2';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPaletteProps {
  palette: Color[];
  previousPalette: Color[];
  transitionId: number;
  onToggleLock: (hex: string) => void;
  generateNewPalette: (harmony?: string) => void;
  harmony: string | null;
  baseColorForContrast: string | null;
  onSetBaseColor: (hex: string | null) => void;
  isCurrentPaletteFavorite: boolean;
  onToggleFavorite: () => void;
  onExtractFromImage: (file: File) => void;
  onExtractFromImageUrl: (url: string) => void;
  isImporting: boolean;
  importError: string | null;
  onReorderPalette: (newPalette: Color[]) => void;
  importedImagePreview: string | null;
  onUpdateColor: (index: number, newHex: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
}

const harmonyDescriptions: { [key: string]: string } = {
    analogous: 'Colors that are next to each other on the color wheel. Serene and comfortable.',
    monochromatic: 'Variations in lightness and saturation of a single color. Clean and elegant.',
    splitcomplement: 'A color and two adjacent to its complement. Vibrant yet balanced.',
    triad: 'Three colors evenly spaced on the wheel. High contrast, harmonious.',
    tetrad: 'Four colors arranged into two complementary pairs. Rich and varied.',
    complementary: "Colors from opposite ends of the wheel. High-contrast and energetic.",
    doublecomplementary: "Two pairs of complementary colors. Rich variety.",
    imported: 'Extracted from an image. Dominant shades from the source.',
};

interface DraggableColorItem {
    id: string;
    color: Color;
}

// Static Swatch for the Overlay Layer - Mimics ColorSwatch Visually but is Non-Interactive
// Now includes isSelected prop to match the visual state of the swatch it replaces
const StaticSwatch: React.FC<{ color: Color; isSelected: boolean }> = ({ color, isSelected }) => {
    const isDark = tinycolor(color.hex).isDark();
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const colorName = tinycolor(color.hex).toName();
    const showName = colorName && colorName.toLowerCase() !== color.hex.toLowerCase();

    return (
        <div 
            className={`flex-1 h-full flex flex-col justify-between items-center p-4 py-6 relative select-none ${isSelected ? 'ring-inset ring-[6px] ring-black/20' : ''}`}
            style={{ backgroundColor: color.hex }}
        >
            {/* Lock Indicator */}
            {color.isLocked && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 backdrop-blur-sm shadow-sm ring-1 z-10 ${isDark ? 'bg-black/20 ring-white/10' : 'bg-white/30 ring-black/5'}`}>
                    <LockIcon className={`w-6 h-6 ${textColor}`} />
                </div>
            )}

            {/* Fake Footer */}
            <motion.div 
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3 mt-auto w-full z-10"
            >
                <div className="text-center w-full flex flex-col items-center relative mt-2">
                    <div className="flex items-center justify-center gap-2 w-full">
                        <div className={`p-1.5 rounded-full ${isDark ? 'text-white/80' : 'text-black/60'}`}>
                            <ColorPickerIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-center text-xl font-mono font-bold uppercase tracking-wider w-[110px] px-1 border-b-2 border-transparent ${textColor}`}>
                            {color.hex}
                        </span>
                    </div>
                    {showName && <p className={`text-xs capitalize opacity-80 mt-0.5 truncate max-w-full px-2 ${textColor}`}>{colorName}</p>}
                </div>

                {/* Spacer to match ColorSwatch action buttons layout to prevent jump. 
                    Buttons are p-2 with w-5 h-5 icons. 16px padding + 20px icon = 36px height. mt-1 is 4px. 
                */}
                <div className="h-[36px] mt-1 w-full opacity-0" />
            </motion.div>
        </div>
    );
};

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
    palette, 
    previousPalette,
    transitionId,
    onToggleLock, 
    generateNewPalette, 
    harmony, 
    baseColorForContrast, 
    onSetBaseColor, 
    isCurrentPaletteFavorite, 
    onToggleFavorite, 
    onExtractFromImage, 
    onExtractFromImageUrl, 
    isImporting, 
    importError, 
    onReorderPalette, 
    importedImagePreview, 
    onUpdateColor,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    isTransitioning,
    onTransitionComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for drag reordering
  const [items, setItems] = useState<DraggableColorItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [imageUrl, setImageUrl] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [selectedHarmony, setSelectedHarmony] = useState<string>('random');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  // State for Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsColor, setDetailsColor] = useState<Color | null>(null);

  // Ref for the overlay container to handle manual opacity hack
  const overlayRef = useRef<HTMLDivElement>(null);

  // We determine if an active transition is occurring
  const hasActiveTransition = previousPalette.length > 0;

  // Use useLayoutEffect to ensure items are updated synchronously before paint.
  // We use stable IDs (ignoring Date.now()) to prevent remounting of Swatches during generation.
  useLayoutEffect(() => {
      if (draggedIndex === null) {
          setItems(prevItems => {
              return palette.map((color, i) => ({
                  // Use the existing ID from the previous state at this index if available.
                  // This ensures that the DOM node key remains stable per slot, 
                  // preventing React from remounting the component when the color changes.
                  id: prevItems[i]?.id ?? `slot-${i}`, 
                  color
              }));
          });
      }
  }, [palette]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
              setIsExportMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onExtractFromImage(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    // Perform the swap locally to show immediate feedback
    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    
    setItems(newItems);
    setDraggedIndex(targetIndex); 
    
    if (selectedColorIndex === draggedIndex) {
        setSelectedColorIndex(targetIndex);
    }
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const finalIndex = draggedIndex;
    // 1. Immediately reset visual drag state so the item scales down and shadow disappears
    setDraggedIndex(null);
    
    // 2. Delay the sync with parent slightly. 
    // This allows the local "settle" animation (removal of isDragging styles) to complete visually
    // before the parent state update triggers a prop change and potential reconciliation.
    if (finalIndex !== null) {
        const newPalette = items.map(i => i.color);
        const isChanged = JSON.stringify(newPalette.map(c => c.hex)) !== JSON.stringify(palette.map(c => c.hex));
        
        if (isChanged) {
            // 200ms matches the duration in ColorSwatch transition
            setTimeout(() => {
                onReorderPalette(newPalette);
            }, 200);
        }
    }
  };

  const handleUrlImport = () => {
    if (imageUrl.trim() && !isImporting) {
        onExtractFromImageUrl(imageUrl.trim());
        setImageUrl('');
    }
  };
  
  const handleUrlInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleUrlImport();
      }
  };

  const handleGenerateClick = () => {
      if (isTransitioning) return;
      generateNewPalette(selectedHarmony === 'random' ? undefined : selectedHarmony);
  };

  const handleOpenDetails = (color: Color) => {
      setDetailsColor(color);
      setIsDetailsModalOpen(true);
  };

  const selectedColor = palette[selectedColorIndex] || palette[0];
  const selectedColorName = selectedColor ? tinycolor(selectedColor.hex).toName() : '';

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-80px)] w-full bg-white overflow-hidden">
        
        <ColorDetailsModal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            color={detailsColor} 
        />

        {/* --- Left Rail (Input/Harmonies) --- */}
        <div className="w-full lg:w-80 flex flex-col border-r border-gray-200 bg-gray-50 p-6 gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            
            {/* 1. Undo / Redo */}
            <div className="flex gap-4 justify-center w-full">
                 <button
                    type="button"
                    onClick={onUndo}
                    disabled={!canUndo || isTransitioning}
                    className="flex-1 flex items-center justify-center p-3 bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed rounded-none active:scale-95 transition-all"
                    aria-label="Undo"
                    title="Undo (Ctrl+Z)"
                >
                    <UndoIcon className="w-5 h-5" />
                 </button>
                 <button
                    type="button"
                    onClick={onRedo}
                    disabled={!canRedo || isTransitioning}
                    className="flex-1 flex items-center justify-center p-3 bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed rounded-none active:scale-95 transition-all"
                    aria-label="Redo"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <RedoIcon className="w-5 h-5" />
                </button>
            </div>

            {/* 2. Color Harmony Selector & Wheel */}
            <div className="flex flex-col items-center text-center gap-4 border-t border-b border-gray-200 py-6 px-2">
                 <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Harmony Rule</p>
                 
                 <div className="relative w-full">
                     <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-lg font-bold capitalize text-gray-800">{harmony || 'Custom'}</h3>
                     </div>
                     {harmony && (
                        <p className="text-xs text-gray-500 leading-relaxed min-h-[2.5em]">
                            {harmonyDescriptions[harmony]}
                        </p>
                     )}
                 </div>
                 
                 <div className="flex justify-center scale-90 origin-center mt-2">
                    <HarmonyVisualizer harmony={harmony} />
                 </div>
                 <div className="scale-90 origin-top -mt-6">
                    <ColorWheel palette={palette} harmony={harmony} />
                 </div>
            </div>

            {/* 3. Import Section (Bottom) */}
            <div className="mt-auto pt-2 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 text-center mb-1">Import Source</p>
                
                {importedImagePreview ? (
                    <div className="relative w-full h-32 overflow-hidden border border-gray-300 group bg-gray-200">
                        <img src={importedImagePreview} alt="Imported source" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => onExtractFromImage(new File([], ''))} // Re-trigger file select logic roughly
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium"
                        >
                            Replace Image
                        </button>
                        {/* Hidden input for replacing */}
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="flex items-center justify-center gap-2 w-full p-3 bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm transition-all"
                    >
                        {isImporting ? (
                            <span className="text-sm">Processing...</span>
                        ) : (
                            <>
                                <UploadCloudIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium">Upload Image</span>
                            </>
                        )}
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="relative flex items-center">
                     <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyPress={handleUrlInputKeyPress}
                        placeholder="Paste image URL..."
                        className="w-full bg-white border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1982c4] focus:ring-1 focus:ring-[#1982c4] transition-all"
                        disabled={isImporting}
                    />
                    <button 
                        type="button"
                        onClick={handleUrlImport}
                        disabled={!imageUrl.trim() || isImporting}
                        className="absolute right-2 text-[#1982c4] disabled:text-gray-300 hover:text-[#156fba]"
                    >
                        <UploadCloudIcon className="w-4 h-4" />
                    </button>
                </div>
                {importError && <p className="text-xs text-red-500 text-center leading-tight">{importError}</p>}
            </div>
        </div>

        {/* --- Center Stage (Palette) --- */}
        <div 
            className="flex-1 flex flex-col justify-center items-center p-4 lg:p-12 bg-gray-100/50 relative overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
        >
            <div 
                className="relative w-full h-full max-h-[60vh] shadow-2xl rounded-none ring-1 ring-black/5 transform-gpu will-change-transform"
                style={{ transform: 'translateZ(0)' }} // Force GPU
            > 
                {/* LAYER 0: NEW PALETTE (INTERACTIVE) */}
                <div className={`absolute inset-0 z-0 flex flex-row w-full h-full bg-white ${hasActiveTransition ? 'pointer-events-none' : ''}`}>
                    {items.map((item, index) => (
                        <ColorSwatch
                            key={item.id}
                            index={index}
                            color={item.color}
                            onToggleLock={onToggleLock}
                            baseColorForContrast={baseColorForContrast}
                            onSetBaseColor={onSetBaseColor}
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedIndex === index}
                            isDropTarget={false}
                            onUpdateColor={onUpdateColor}
                            // If transition is active, forcing selected to false prevents the underlay from popping up 
                            // (scaling up) behind the overlay, which causes visual bleeds/glitches.
                            isSelected={hasActiveTransition ? false : selectedColorIndex === index}
                            onClick={() => setSelectedColorIndex(index)}
                            onOpenDetails={() => handleOpenDetails(item.color)}
                            isTransitioning={hasActiveTransition}
                        />
                    ))}
                </div>

                {/* LAYER 1: OLD PALETTE OVERLAY (STATIC & WIPES AWAY) */}
                {hasActiveTransition && (
                    <div 
                        ref={overlayRef}
                        className="absolute inset-0 z-50 pointer-events-none flex w-full h-full"
                    >
                         {previousPalette.map((color, index) => {
                            const isSelected = index === selectedColorIndex;
                            return (
                                <motion.div 
                                    key={`${transitionId}-${index}`} 
                                    className="flex-1 h-full min-w-0"
                                    style={{
                                        // Apply selected styles manually to the overlay container to match ColorSwatch state
                                        zIndex: isSelected ? 60 : 51, 
                                        scale: isSelected ? 1.02 : 1,
                                        boxShadow: isSelected ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)" : "none"
                                    }}
                                    initial={{ clipPath: 'inset(0 0 0 0)' }}
                                    animate={{ clipPath: 'inset(100% 0 0 0)' }}
                                    transition={{ 
                                        duration: 0.65, 
                                        ease: [0.22, 1, 0.36, 1], 
                                        delay: index * 0.06 
                                    }}
                                    onAnimationComplete={() => {
                                        // Strictly wait for the LAST element to finish animation
                                        if (index === previousPalette.length - 1) {
                                            // 1. CRITICAL: Force immediate zero opacity via DOM style to mask unmount flicker
                                            if (overlayRef.current) {
                                                overlayRef.current.style.opacity = '0';
                                            }
                                            
                                            // 2. Use Double RAF pattern to guarantee the opacity change paints 
                                            // before we execute the state change that unmounts the component.
                                            requestAnimationFrame(() => {
                                                requestAnimationFrame(() => {
                                                    if (onTransitionComplete) {
                                                        onTransitionComplete();
                                                    }
                                                });
                                            });
                                        }
                                    }}
                                >
                                    <StaticSwatch color={color} isSelected={isSelected} />
                                </motion.div>
                            );
                         })}
                    </div>
                )}
            </div>
            <p className="mt-8 text-gray-400 text-sm font-medium tracking-wide animate-pulse">Press spacebar to generate</p>
        </div>

        {/* --- Right Rail (Data/Actions) --- */}
        <div className="w-full lg:w-80 flex flex-col border-l border-gray-200 bg-gray-50 p-6 gap-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 shrink-0 z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            
            {/* 1. Generate Actions (Top) */}
            <div className="flex flex-col gap-0 shadow-sm">
                <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isTransitioning}
                    className="w-full py-4 bg-[#1982c4] text-white font-bold text-lg shadow-md hover:bg-[#156fba] transition-colors relative z-10 disabled:opacity-80 disabled:cursor-wait"
                >
                    {isTransitioning ? 'Generating...' : 'Generate'}
                </button>
                <div className="relative bg-white border-x border-b border-gray-300">
                    <select
                        value={selectedHarmony}
                        onChange={(e) => setSelectedHarmony(e.target.value)}
                        className="w-full p-3 pr-8 bg-transparent text-sm text-gray-700 font-medium cursor-pointer focus:outline-none appearance-none"
                    >
                        <option value="random">Random Rule</option>
                        <option disabled>──────────</option>
                        {HARMONY_RULES.map(rule => (
                            <option key={rule} value={rule} className="capitalize">{rule}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* 2. Detailed Color Data (Middle) */}
            {selectedColor && (
                <div className="flex-1 flex flex-col gap-4 border-t border-b border-gray-200 py-6 px-1">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Selected Color</p>
                        {selectedColor.isLocked && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 font-bold uppercase">Locked</span>}
                    </div>
                    
                    {/* Big Hex & Preview */}
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 shadow-sm border border-gray-200 relative" style={{backgroundColor: selectedColor.hex}}>
                            {tinycolor(selectedColor.hex).getAlpha() < 1 && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCAwSDRWNEgwem00IDRIN1Y4SDR6IiBmaWxsPSIjY2NjIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] -z-10"></div>}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-2xl font-mono font-bold text-gray-900 leading-none">{selectedColor.hex}</h2>
                            <p className="text-sm text-gray-500 capitalize mt-1 truncate" title={selectedColorName || ''}>{selectedColorName || 'Unknown'}</p>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-baseline border-b border-gray-200 pb-1 mb-1">
                                <span className="text-xs text-gray-500 font-medium">RGB</span>
                                <span className="font-mono text-xs text-gray-400">sRGB</span>
                            </div>
                            <span className="font-mono text-sm text-gray-800 block select-all">{selectedColor.rgb}</span>
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline border-b border-gray-200 pb-1 mb-1">
                                <span className="text-xs text-gray-500 font-medium">Display P3</span>
                                <span className="font-mono text-xs text-gray-400">CSS Color 4</span>
                            </div>
                            <span className="font-mono text-sm text-gray-800 block select-all break-words">{selectedColor.p3}</span>
                        </div>
                        
                        <div className="pt-2">
                             <p className="text-xs text-gray-400 uppercase mb-2 font-bold">WCAG Contrast</p>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-2 border border-gray-200 shadow-sm">
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Vs White</span>
                                    <div className="flex items-end gap-2">
                                        <span className="font-bold text-xl text-gray-800 leading-none">{selectedColor.wcagWhite.toFixed(2)}</span>
                                        {selectedColor.wcagWhiteCompliant ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 font-bold border border-green-200">AA</span>
                                        ) : (
                                            <span className="text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 font-bold border border-red-100">Fail</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white p-2 border border-gray-200 shadow-sm">
                                    <span className="text-[10px] text-gray-400 uppercase block mb-1">Vs Black</span>
                                    <div className="flex items-end gap-2">
                                        <span className="font-bold text-xl text-gray-800 leading-none">{selectedColor.wcagBlack.toFixed(2)}</span>
                                        {selectedColor.wcagBlackCompliant ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 font-bold border border-green-200">AA</span>
                                        ) : (
                                            <span className="text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 font-bold border border-red-100">Fail</span>
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Global Actions (Bottom) */}
            <div className="mt-auto flex flex-col gap-3 pt-2">
                {/* Favorite Button */}
                <button 
                    type="button"
                    onClick={onToggleFavorite}
                    className={`flex items-center justify-center gap-3 w-full p-3 border transition-all group ${isCurrentPaletteFavorite ? 'bg-[#ffca3a]/10 border-[#ffca3a] text-gray-900' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                >
                    <HeartIcon filled={isCurrentPaletteFavorite} className={`w-5 h-5 ${isCurrentPaletteFavorite ? 'text-[#ffca3a]' : 'text-gray-400 group-hover:text-red-400'}`} /> 
                    <span className="font-medium text-sm">{isCurrentPaletteFavorite ? 'Saved to Favorites' : 'Save Palette'}</span>
                </button>
                
                {/* Export Menu */}
                <div className="relative" ref={exportMenuRef}>
                    <button 
                        type="button"
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className={`flex items-center justify-center gap-3 w-full p-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all ${isExportMenuOpen ? 'bg-gray-100 ring-2 ring-gray-200' : ''}`}
                    >
                        <DownloadIcon className="w-5 h-5 text-gray-500" /> 
                        <span className="font-medium text-sm">Export Palette</span>
                    </button>
                    
                    {isExportMenuOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 shadow-xl z-20 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button type="button" onClick={() => exportAsJson(palette)} className="px-4 py-3 text-sm text-left hover:bg-gray-50 text-gray-700 transition-colors border-b border-gray-100">JSON Code</button>
                            <button type="button" onClick={() => exportAsSvg(palette)} className="px-4 py-3 text-sm text-left hover:bg-gray-50 text-gray-700 transition-colors border-b border-gray-100">SVG Image</button>
                            <button type="button" onClick={() => exportAsPdf(palette)} className="px-4 py-3 text-sm text-left hover:bg-gray-50 text-gray-700 transition-colors border-b border-gray-100">PDF Document</button>
                            <button type="button" onClick={() => exportAsHtml(palette)} className="px-4 py-3 text-sm text-left hover:bg-gray-50 text-gray-700 transition-colors">HTML Page</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    </div>
  );
};

export default ColorPalette;