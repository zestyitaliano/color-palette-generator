
import React, { useState, useEffect, useRef } from 'react';
import { Color } from '../types';
import tinycolor from 'tinycolor2';
import { motion } from 'framer-motion';
import { LockIcon, UnlockIcon, CopyIcon, TargetIcon, ColorPickerIcon, InfoIcon } from './icons/Icons';

interface ColorSwatchProps {
  index: number;
  color: Color;
  onToggleLock: (hex: string) => void;
  baseColorForContrast: string | null;
  onSetBaseColor: (hex: string | null) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
  isDropTarget: boolean;
  onUpdateColor: (index: number, newHex: string) => void;
  isSelected: boolean;
  onClick: () => void;
  onOpenDetails: () => void;
  enableLayout?: boolean;
  isTransitioning?: boolean;
}

const ContrastInfo: React.FC<{ base: string; against: string }> = ({ base, against }) => {
    const contrast = tinycolor.readability(base, against);
    return (
        <div className="mb-2 text-center text-xs bg-white/90 p-2 w-full backdrop-blur-sm border border-black/5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Vs Base</p>
            <p className="text-xl font-bold font-mono text-gray-900 my-1">{contrast.toFixed(2)}:1</p>
        </div>
    );
};

// Pre-load transparent image to prevent drag icon glitch
const emptyDragImage = new Image();
emptyDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const ColorSwatch: React.FC<ColorSwatchProps> = ({ 
    index, 
    color,
    onToggleLock, 
    baseColorForContrast, 
    onSetBaseColor, 
    onDragStart, 
    onDragEnter, 
    onDragEnd, 
    isDragging, 
    isDropTarget, 
    onUpdateColor,
    isSelected,
    onClick,
    onOpenDetails,
    enableLayout = true,
    isTransitioning = false
}) => {
  const [copied, setCopied] = useState(false);
  const [inputValue, setInputValue] = useState(color.hex);
  const [isValid, setIsValid] = useState(true);
  
  const isInternalChange = useRef(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const isDark = tinycolor(color.hex).isDark();
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const colorName = tinycolor(color.hex).toName();
  const showName = colorName && colorName.toLowerCase() !== color.hex.toLowerCase();
  
  const isBaseColor = baseColorForContrast === color.hex;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
      setInputValue(color.hex);
      setIsValid(true);
  }, [color.hex]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
  };

  const handleSetBase = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSetBaseColor(isBaseColor ? null : color.hex);
  }

  const handleToggleLockClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleLock(color.hex);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsValid(tinycolor(val).isValid());
  };

  const handleInputBlur = () => {
      const newColor = tinycolor(inputValue);
      if (newColor.isValid()) {
          const newHex = newColor.toHexString();
          if (newHex !== color.hex) {
              isInternalChange.current = true;
              onUpdateColor(index, newHex);
          }
          setInputValue(newHex);
          setIsValid(true);
      } else {
          setInputValue(color.hex);
          setIsValid(true);
      }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      isInternalChange.current = true;
      const val = e.target.value;
      onUpdateColor(index, val);
      setInputValue(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.currentTarget.blur();
      }
  };

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
      // Use pre-loaded transparent image
      e.dataTransfer.setDragImage(emptyDragImage, 0, 0);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(index);
  };
  
  const selectedClasses = isSelected && !isDragging
    ? 'ring-inset ring-[6px] ring-black/20'
    : '';

  return (
    <motion.div
      layout={enableLayout && !isTransitioning}
      initial={false}
      draggable="true"
      onDragStart={handleDragStartInternal as any}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd as any}
      onClick={onClick}
      className={`
        select-none flex-1 basis-0 min-w-0 flex flex-col justify-between items-center p-4 py-6 relative cursor-pointer active:cursor-grabbing focus:outline-none group 
        transition-[background-color,box-shadow,opacity,color] duration-200 ease-out
        ${selectedClasses}
      `}
      
      // Motion Animate: Handles Base, Dragging, and Selected states
      animate={{
        backgroundColor: color.hex,
        scale: isDragging ? 1.08 : (isSelected ? 1.02 : 1),
        zIndex: isDragging ? 100 : (isSelected ? 30 : 1),
        boxShadow: isDragging 
            ? "0 35px 60px -15px rgba(0, 0, 0, 0.3)" // Deep shadow when lifted
            : (isSelected 
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
                : "0 0 0 0 rgba(0,0,0,0)")
      }}

      // Motion Hover: Only apply hover effects if not dragging
      whileHover={!isDragging ? { 
        scale: isSelected ? 1.03 : 1.05, 
        zIndex: 40,
        boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1)"
      } : {}}
      
      transition={{
          duration: 0.2,
          ease: "easeInOut"
      }}
    >
        {/* Base Color Marker */}
        {isBaseColor && !isTransitioning && (
            <div className={`absolute top-0 left-0 right-0 p-1 bg-white/90 text-[#1982c4] text-[10px] text-center font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm z-10 transition-opacity duration-200`}>
                Base Color
            </div>
        )}
        
        {/* Lock Indicator */}
        {color.isLocked && !isTransitioning && (
            <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 backdrop-blur-sm shadow-sm ring-1 pointer-events-none z-10 ${isDark ? 'bg-black/20 ring-white/10' : 'bg-white/30 ring-black/5'}`}
            >
                <LockIcon className={`w-6 h-6 ${textColor} transition-colors duration-300`} />
            </div>
        )}

      {/* Footer Actions */}
      {/* Hide footer content during active shutter transitions to prevent visual double-rendering/jumping */}
      <div className={`flex flex-col items-center gap-3 mt-auto w-full z-10 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {baseColorForContrast && !isBaseColor && (
            <ContrastInfo base={baseColorForContrast} against={color.hex} />
        )}

        <div className="text-center w-full flex flex-col items-center relative mt-2">
            <div className="flex items-center justify-center gap-2 w-full">
                {/* Native Color Picker */}
                <input 
                    ref={colorInputRef}
                    type="color" 
                    value={tinycolor(color.hex).toHexString()} 
                    onChange={handleColorPickerChange}
                    className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
                    tabIndex={-1}
                />
                
                {/* Visual Picker Trigger */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        colorInputRef.current?.click();
                    }}
                    className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-white/20 text-white/80 hover:text-white' : 'hover:bg-black/10 text-black/60 hover:text-black'}`}
                    title="Pick color visually"
                >
                    <ColorPickerIcon className="w-4 h-4" />
                </button>

                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    spellCheck={false}
                    className={`text-center text-xl font-mono font-bold uppercase tracking-wider w-[110px] focus:outline-none border-b-2 px-1 bg-transparent border-transparent focus:border-current transition-all duration-300 ${textColor} ${!isValid ? 'text-red-500 border-red-500' : ''}`}
                />
            </div>
            {isValid && showName && <p className={`text-xs capitalize opacity-80 mt-0.5 truncate max-w-full px-2 transition-colors duration-300 ${textColor}`}>{colorName}</p>}
        </div>
        
        <div className={`flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform translate-y-2 group-hover:translate-y-0 ${textColor}`}>
            <button onClick={(e) => { e.stopPropagation(); onOpenDetails(); }} className={`p-2 transition-colors duration-200 ${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} title="View Details">
                <InfoIcon className="w-5 h-5" />
            </button>
            <button onClick={handleToggleLockClick} className={`p-2 transition-colors duration-200 ${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} title={color.isLocked ? "Unlock" : "Lock"}>
                {color.isLocked ? <LockIcon className="w-5 h-5" /> : <UnlockIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleCopy} className={`p-2 transition-colors duration-200 ${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} title="Copy Hex">
                <CopyIcon className="w-5 h-5" />
            </button>
            <button onClick={handleSetBase} className={`p-2 transition-colors duration-200 ${isBaseColor ? (isDark ? 'bg-white/30' : 'bg-black/20') : ''} ${isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'}`} title="Set as Base Color for Contrast">
                <TargetIcon className="w-5 h-5" />
            </button>
        </div>
        {copied && <span className="absolute bottom-20 bg-gray-900 text-white text-xs px-2 py-1 shadow-lg pointer-events-none">Copied!</span>}
      </div>
    </motion.div>
  );
};

export default ColorSwatch;
