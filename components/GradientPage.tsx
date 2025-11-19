
import React, { useState, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { CheckIcon, RedoIcon } from './icons/Icons';
import { clampHex, HexColor } from '../utils/colorUtils';

interface GradientPageProps {
  onLoadPalette: (colors: string[]) => void;
  currentPalette?: HexColor[];
}

type GradientMode = 'rgb' | 'hsl';

const generateGradient = (start: HexColor, end: HexColor, steps: number, mode: GradientMode): HexColor[] => {
  if (steps <= 1) return [clampHex(start), clampHex(end)];

  const s = tinycolor(start);
  const e = tinycolor(end);

  if (!s.isValid() || !e.isValid()) return [clampHex(start), clampHex(end)];

  const result: HexColor[] = [];

  if (mode === 'rgb') {
    for (let i = 0; i < steps; i++) {
      const ratio = steps === 1 ? 0 : i / (steps - 1);
      result.push(
        tinycolor.mix(s, e, ratio * 100).toHexString().toUpperCase()
      );
    }
  } else {
    // HSL interpolation for smoother gradients
    const sHsl = s.toHsl();
    const eHsl = e.toHsl();

    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1);
      const h = sHsl.h + (eHsl.h - sHsl.h) * t;
      const sVal = sHsl.s + (eHsl.s - sHsl.s) * t;
      const l = sHsl.l + (eHsl.l - sHsl.l) * t;

      result.push(
        tinycolor({ h, s: sVal, l }).toHexString().toUpperCase()
      );
    }
  }

  return result;
};

const GradientPage: React.FC<GradientPageProps> = ({ onLoadPalette, currentPalette }) => {
  const [startColor, setStartColor] = useState<HexColor>('#8338EC');
  const [endColor, setEndColor] = useState<HexColor>('#FFBE0B');
  const [steps, setSteps] = useState(5);
  const [mode, setMode] = useState<GradientMode>('hsl');

  const colors = useMemo(
    () => generateGradient(startColor, endColor, steps, mode),
    [startColor, endColor, steps, mode]
  );

  const handleApply = () => {
    onLoadPalette(colors);
  };

  const handleReverse = () => {
      const temp = startColor;
      setStartColor(endColor);
      setEndColor(temp);
  };

  const handleUseEnds = () => {
      if (currentPalette && currentPalette.length > 0) {
          setStartColor(clampHex(currentPalette[0]));
          setEndColor(clampHex(currentPalette[currentPalette.length - 1]));
      }
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-full">
      <div className="max-w-5xl mx-auto flex flex-col min-h-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gradient Builder</h2>
            <p className="text-gray-500 max-w-2xl">
                Pick two colors and generate a perfect gradient palette.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button
                type="button"
                onClick={handleReverse}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                title="Swap start and end colors"
             >
                 <RedoIcon className="w-4 h-4" />
                 Reverse
             </button>
             <button
                type="button"
                onClick={handleUseEnds}
                disabled={!currentPalette || currentPalette.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Use first and last colors from your current palette"
             >
                 Use Palette Ends
             </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Start Color */}
            <div className="flex flex-col gap-3">
                <label htmlFor="gradient-start-hex" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Start Color
                </label>
                <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full shadow-inner overflow-hidden ring-1 ring-black/5">
                    <div className="absolute inset-0" style={{ backgroundColor: startColor }} />
                    <input
                        type="color"
                        value={tinycolor(startColor).toHexString()}
                        onChange={(e) => setStartColor(e.target.value.toUpperCase())}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Start color picker"
                    />
                </div>
                <input
                    id="gradient-start-hex"
                    type="text"
                    value={startColor}
                    onChange={(e) => setStartColor(clampHex(e.target.value))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono uppercase font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-transparent transition-all"
                    aria-label="Start color hex code"
                />
                </div>
            </div>

            {/* End Color */}
            <div className="flex flex-col gap-3">
                <label htmlFor="gradient-end-hex" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                End Color
                </label>
                <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full shadow-inner overflow-hidden ring-1 ring-black/5">
                     <div className="absolute inset-0" style={{ backgroundColor: endColor }} />
                    <input
                        type="color"
                        value={tinycolor(endColor).toHexString()}
                        onChange={(e) => setEndColor(e.target.value.toUpperCase())}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="End color picker"
                    />
                </div>
                <input
                    id="gradient-end-hex"
                    type="text"
                    value={endColor}
                    onChange={(e) => setEndColor(clampHex(e.target.value))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono uppercase font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-transparent transition-all"
                    aria-label="End color hex code"
                />
                </div>
            </div>

            {/* Steps & Mode */}
            <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <label htmlFor="gradient-steps" className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Steps & Mode
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button 
                            type="button"
                            onClick={() => setMode('hsl')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'hsl' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Smooth (HSL)
                        </button>
                         <button 
                            type="button"
                            onClick={() => setMode('rgb')}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'rgb' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Simple (RGB)
                        </button>
                    </div>
                 </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#1982c4] font-mono w-6 text-center">
                        {steps}
                    </span>
                    <input
                        id="gradient-steps"
                        type="range"
                        min={3}
                        max={10}
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1982c4]"
                        aria-label="Number of gradient steps"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase px-1">
                    <span>3</span>
                    <span>10</span>
                </div>
            </div>
            </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex-1 flex flex-col">
            <div className="flex justify-between items-end mb-4">
                 <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Preview
                </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
                {/* Gradient Bar */}
                <div className="w-full h-24 md:h-32 rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden flex mb-6">
                    {colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full relative group" style={{ backgroundColor: c }}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px]">
                                <span className={`text-xs font-bold ${tinycolor(c).isDark() ? 'text-white' : 'text-black'}`}>{c}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chips */}
                <div className="flex flex-wrap justify-center gap-4">
                    {colors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div 
                                className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-sm border border-gray-200" 
                                style={{ backgroundColor: c }}
                            />
                            <span className="text-[10px] md:text-xs font-mono text-gray-500 uppercase">{c}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
            <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-8 py-4 bg-[#1982c4] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#1982c4]/20 hover:bg-[#156fba] hover:scale-[1.02] active:scale-95 transition-all"
            >
            <CheckIcon className="w-6 h-6" />
            Use Palette
            </button>
        </div>

      </div>
    </div>
  );
};

export default GradientPage;
