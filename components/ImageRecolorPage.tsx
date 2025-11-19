
import React, { useEffect, useMemo, useState } from 'react';
import cityscape from './cityscape';
import { clampHex, isValidHex, HexColor } from '../utils/colorUtils';
import { DownloadIcon, ShuffleIcon, XIcon, RedoIcon } from './icons/Icons';
import tinycolor from 'tinycolor2';

// Grouping the raw SVG colors into semantic roles
const ROLE_DEFINITIONS = {
  // Removed #f3eddf, #fcecdf (building tops) from sky to prevent them disappearing
  sky: ['#bfe9df', '#c0e9d9', '#d3e1e4', '#ebf1f1'], 
  farBuildings: ['#a4b9be', '#cdcdcd', '#89d5c9'], // Misted/distant items
  // Added #f3eddf, #fcecdf to midBuildings so they match the structure
  midBuildings: ['#595b6d', '#41b6b0', '#48b4b7', '#3eafad', '#abe0d6', '#e4d5be', '#f3eddf', '#fcecdf'], 
  foregroundBuildings: ['#181e49', '#2e336d'], // Darkest blocks
  lights: ['#fecc51', '#ffb217', '#cc8911', '#d78d08'], // Windows/Sun
  shadows: ['#1d1d1b'], // Outlines/Deep shadows
  background: ['#ffffff', '#fff'] // Pure background - LOCKED
};

type RecolorRole = keyof typeof ROLE_DEFINITIONS;

const ROLES_DISPLAY: { id: RecolorRole; label: string; description: string }[] = [
  { id: 'sky', label: 'Sky & Atmosphere', description: 'Auto-generated atmospheric tint' },
  { id: 'lights', label: 'Lights & Windows', description: 'Sun, windows, and highlights' },
  { id: 'farBuildings', label: 'Far Buildings', description: 'Distant or misted structures' },
  { id: 'midBuildings', label: 'Mid-ground', description: 'Main building surfaces' },
  { id: 'foregroundBuildings', label: 'Foreground', description: 'Darkest front-facing elements' },
  { id: 'shadows', label: 'Outlines', description: 'Structural lines and deep shadows' },
];

interface ImageRecolorPageProps {
  currentPalette: HexColor[];
}

// Generate a flat list of mappings based on role assignments
const generateMappingsFromRoles = (roleAssignments: Record<RecolorRole, string>) => {
  const mappings: { base: string; target: string }[] = [];
  
  (Object.keys(ROLE_DEFINITIONS) as RecolorRole[]).forEach((role) => {
    const target = roleAssignments[role];
    const baseColors = ROLE_DEFINITIONS[role];
    baseColors.forEach(base => {
      mappings.push({ base, target });
    });
  });

  return mappings;
};

const applyMappingsToSvg = (svg: string, mappings: { base: string; target: string }[]): string => {
  let result = svg;
  const PROTECTED_HEXES = ['#ffffff', '#fff', '#fdfdfd', '#fafafa'];

  mappings.forEach(({ base, target }) => {
    if (!target || base.toLowerCase() === target.toLowerCase()) return;
    if (PROTECTED_HEXES.includes(base.toLowerCase())) return;

    // Simple global replace for the specific hex strings
    const baseRegex = new RegExp(base, 'gi');
    result = result.replace(baseRegex, target);
  });

  return result;
};

const ImageRecolorPage: React.FC<ImageRecolorPageProps> = ({ currentPalette }) => {
  
  // State tracks which color is assigned to which role
  const [roleAssignments, setRoleAssignments] = useState<Record<RecolorRole, string>>({
    sky: '#e4d5be',
    farBuildings: '#cdcdcd',
    midBuildings: '#595b6d',
    foregroundBuildings: '#181e49',
    lights: '#fecc51',
    shadows: '#1d1d1b',
    background: '#ffffff'
  });

  // Smart assignment logic based on the prompt's strategy
  const calculateSmartAssignments = (palette: HexColor[]) => {
    if (!palette || palette.length === 0) return;

    // 1. Sort by Luminance (Light -> Dark)
    // We want index 0 to be the lightest (highest brightness)
    const sortedByLum = [...palette].sort((a, b) => tinycolor(b).getBrightness() - tinycolor(a).getBrightness());
    
    // 2. Sort by Saturation (High -> Low) used for Sky Tint base
    const sortedBySat = [...palette].sort((a, b) => tinycolor(b).toHsl().s - tinycolor(a).toHsl().s);

    // Sky Logic:
    // Use the most saturated color to preserve the palette's "mood" or "temperature",
    // but mix it heavily with white (85%) to create an atmospheric tint that sits behind everything.
    const baseSkyColor = sortedBySat[0];
    const skyTint = tinycolor.mix(baseSkyColor, '#ffffff', 85).toHexString();

    // Assignment Strategy:
    // We map the 5 palette colors to the 5 structural roles (excluding Sky which is derived, and Background which is white)
    // Roles ordered by depth/lightness:
    // Lights (Brightest) -> Far Buildings -> Mid Buildings -> Foreground -> Shadows (Darkest)
    
    const assignments: Record<RecolorRole, string> = {
      background: '#ffffff',
      
      // Lights: The absolute lightest/brightest color in the palette
      lights: sortedByLum[0], 
      
      // Sky: Derived tint
      sky: skyTint, 

      // Far Buildings: 2nd Lightest - Atmospheric perspective pushes them back
      farBuildings: sortedByLum[1] || sortedByLum[0],
      
      // Mid Buildings: Middle tone - The main body of the city
      midBuildings: sortedByLum[2] || sortedByLum[1] || sortedByLum[0],
      
      // Foreground Buildings: 2nd Darkest - High contrast silhouettes
      foregroundBuildings: sortedByLum[3] || sortedByLum[2] || sortedByLum[0],

      // Shadows/Outlines: The absolute darkest color for structure and depth
      shadows: sortedByLum[4] || sortedByLum[3] || sortedByLum[0], 
    };

    setRoleAssignments(assignments);
  };

  // Auto-calculate when palette changes
  useEffect(() => {
    calculateSmartAssignments(currentPalette);
  }, [currentPalette]);

  const recoloredSvg = useMemo(() => {
    const mappings = generateMappingsFromRoles(roleAssignments);
    return applyMappingsToSvg(cityscape, mappings);
  }, [roleAssignments]);

  const handleRoleColorChange = (role: RecolorRole, newColor: string) => {
    setRoleAssignments(prev => ({
      ...prev,
      [role]: clampHex(newColor)
    }));
  };

  const handleShuffle = () => {
    if (!currentPalette || currentPalette.length === 0) return;
    // Randomly assign palette colors to roles (keeping background white)
    const shuffled = [...currentPalette].sort(() => Math.random() - 0.5);
    
    setRoleAssignments(prev => ({
      ...prev,
      // Keep the tint logic for sky even during shuffle, but use a random base
      sky: tinycolor.mix(shuffled[0], '#ffffff', 85).toHexString(),
      lights: shuffled[0],
      farBuildings: shuffled[1] || shuffled[0],
      midBuildings: shuffled[2] || shuffled[0],
      foregroundBuildings: shuffled[3] || shuffled[0],
      shadows: shuffled[4] || shuffled[0], 
    }));
  };

  const handleReset = () => {
    calculateSmartAssignments(currentPalette);
  };

  const handleExportSvg = () => {
    const blob = new Blob([recoloredSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recolored-cityscape.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-full">
        <div className="max-w-6xl mx-auto flex flex-col min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Cityscape Recolor
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-xl">
            Visualize your palette on a complex illustration. Colors are intelligently assigned to roles (Sky, Buildings, Lights) for optimal contrast.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
             <button
                type="button"
                onClick={handleShuffle}
                disabled={!currentPalette || currentPalette.length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-95"
            >
                <ShuffleIcon className="w-4 h-4" />
                Shuffle
            </button>
             <button
                type="button"
                onClick={handleReset}
                disabled={!currentPalette || currentPalette.length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 shadow-sm bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
                <RedoIcon className="w-4 h-4 transform -scale-x-100" />
                Reset Logic
            </button>
             <button
                type="button"
                onClick={handleExportSvg}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#1982c4] text-white hover:bg-[#156fba] transition-colors shadow-sm"
            >
                <DownloadIcon className="w-4 h-4" />
                Export SVG
            </button>
        </div>
      </div>

      {/* Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Original
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-white border border-gray-100 relative">
            <div
              className="max-h-[320px] w-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: cityscape }}
            />
          </div>
        </div>

        {/* Recolored */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Recolored
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              White Background Locked
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-white border border-gray-100 relative">
            <div
              className="max-h-[320px] w-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: recoloredSvg }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Role Mapping</h3>
                <p className="text-sm text-gray-500">Assign your palette colors to specific parts of the illustration.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ROLES_DISPLAY.map((roleData) => (
            <div
              key={roleData.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white transition-all group"
            >
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{roleData.label}</span>
                    <span className="text-[10px] text-gray-400">{roleData.description}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white shadow-sm relative overflow-hidden"
                        onClick={() => {
                            // Cycle through currentPalette
                            if (!currentPalette || currentPalette.length === 0) return;
                            
                            // Find current index, or default to -1
                            // Note: roleAssignments might have a computed tint for sky, so it might not match exactly.
                            // If no match, we start at 0.
                            const currentHex = roleAssignments[roleData.id];
                            const currentIndex = currentPalette
                                .map((c) => c.toLowerCase())
                                .indexOf(currentHex.toLowerCase());
                            
                            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % currentPalette.length;
                            
                            // For sky, we apply the tint logic to the picked color
                            if (roleData.id === 'sky') {
                                const tinted = tinycolor.mix(currentPalette[nextIndex], '#ffffff', 85).toHexString();
                                handleRoleColorChange(roleData.id, tinted);
                            } else {
                                handleRoleColorChange(roleData.id, currentPalette[nextIndex]);
                            }
                        }}
                        title="Click to cycle palette color"
                    >
                        <div className="absolute inset-0" style={{ backgroundColor: roleAssignments[roleData.id] }} />
                    </button>
                    
                    {/* Manual Picker */}
                    <div className="relative h-8 w-6">
                             <label className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                 <input
                                    type="color"
                                    value={roleAssignments[roleData.id]}
                                    onChange={(e) => handleRoleColorChange(roleData.id, e.target.value)}
                                    className="w-full h-full opacity-0 absolute inset-0 cursor-pointer"
                                />
                                <span className="text-gray-400">▼</span>
                             </label>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ImageRecolorPage;
