
import tinycolor from 'tinycolor2';
import { 
    converter, 
    formatHex, 
    formatRgb, 
    formatCss, 
    wcagContrast, 
    parse, 
    Color as CuloriColor 
} from 'culori';
import { Color } from '../types';

const PALETTE_SIZE = 5;
const toLch = converter('lch');
const toP3 = converter('p3');
const toRgb = converter('rgb');

export const HARMONY_RULES = ['analogous', 'monochromatic', 'splitcomplement', 'triad', 'tetrad', 'complementary', 'doublecomplementary'];

// Helper to create a fully populated Color object
export const createColorObject = (hex: string, isLocked: boolean = false): Color => {
    const c = parse(hex);
    if (!c) throw new Error("Invalid color");
    
    const rgb = formatRgb(c);
    const p3 = formatCss(toP3(c));
    
    // Contrast
    const white = parse('#ffffff');
    const black = parse('#000000');
    const contrastWhite = white ? wcagContrast(c, white) : 0;
    const contrastBlack = black ? wcagContrast(c, black) : 0;
    
    const wcagWhiteCompliant = contrastWhite >= 4.5;
    const wcagBlackCompliant = contrastBlack >= 4.5;
    const isCompliant = wcagWhiteCompliant || wcagBlackCompliant;

    return {
        hex: formatHex(c),
        rgb,
        p3,
        isLocked,
        wcagWhite: contrastWhite,
        wcagBlack: contrastBlack,
        wcagWhiteCompliant,
        wcagBlackCompliant,
        isCompliant
    };
};

// Ensure color meets WCAG AA (4.5:1) against at least one standard background (Black or White)
const ensureContrastCompliance = (lchColor: CuloriColor): CuloriColor => {
    const white = parse('#ffffff')!;
    const black = parse('#000000')!;
    
    let testColor = { ...lchColor };
    let contrastW = wcagContrast(testColor, white);
    let contrastB = wcagContrast(testColor, black);

    // If already compliant against one, return
    if (contrastW >= 4.5 || contrastB >= 4.5) return lchColor;

    // Adjust Luminance to meet threshold
    let attempts = 0;
    while (attempts < 50) {
        if ((testColor.l || 0) > 50) {
             testColor.l = (testColor.l || 0) + 2;
        } else {
             testColor.l = (testColor.l || 0) - 2;
        }
        
        // Clamp
        testColor.l = Math.max(0, Math.min(100, testColor.l || 0));

        contrastW = wcagContrast(testColor, white);
        contrastB = wcagContrast(testColor, black);
        
        if (contrastW >= 4.5 || contrastB >= 4.5) break;
        attempts++;
    }
    
    return testColor;
};

// Adjust adjacent colors to prevent simultaneous contrast issues (visual bleeding)
const applySimultaneousContrast = (palette: CuloriColor[]): CuloriColor[] => {
    const newPalette = [...palette];
    
    for (let i = 0; i < newPalette.length - 1; i++) {
        const c1 = newPalette[i];
        const c2 = newPalette[i + 1];
        
        if (!c1.l || !c2.l) continue;

        const lDiff = Math.abs(c1.l - c2.l);
        
        // If luminance is very close, visuals can look muddy or vibrate
        if (lDiff < 10) {
             // Push them apart slightly
             if (c1.l > c2.l) {
                 c1.l = Math.min(100, c1.l + 2);
                 c2.l = Math.max(0, c2.l - 2);
             } else {
                 c1.l = Math.max(0, c1.l - 2);
                 c2.l = Math.min(100, c2.l + 2);
             }
        }
    }
    return newPalette;
};


export const generatePalette = (currentPalette: Color[], targetHarmony?: string): { palette: Color[], harmony: string } => {
    const lockedIndices = currentPalette.map((c, i) => c.isLocked ? i : -1).filter(i => i !== -1);
    const isInitial = currentPalette.length === 0;

    // Base Color Selection (LCh)
    let baseLch: CuloriColor;
    if (isInitial || lockedIndices.length === 0) {
        // Random LCh start
        baseLch = { mode: 'lch', l: 50 + Math.random() * 30, c: 30 + Math.random() * 50, h: Math.random() * 360 };
    } else {
        // Use the first locked color as anchor or random locked
        const anchor = currentPalette[lockedIndices[Math.floor(Math.random() * lockedIndices.length)]];
        baseLch = toLch(parse(anchor.hex) || '#000');
    }

    const rule = targetHarmony && HARMONY_RULES.includes(targetHarmony) 
        ? targetHarmony 
        : HARMONY_RULES[Math.floor(Math.random() * HARMONY_RULES.length)];

    let lchColors: CuloriColor[] = [];

    // Generate Harmony in LCh Space
    switch(rule) {
        case 'analogous':
            // Rotate hue slightly (-30 to +30), vary L slightly
            for (let i = 0; i < PALETTE_SIZE; i++) {
                const hueShift = (i - Math.floor(PALETTE_SIZE / 2)) * 15;
                lchColors.push({ ...baseLch, h: (baseLch.h || 0) + hueShift });
            }
            break;
        case 'monochromatic':
            // Fixed Hue, step L and C
            for (let i = 0; i < PALETTE_SIZE; i++) {
                const step = (i * 15);
                lchColors.push({ 
                    ...baseLch, 
                    l: Math.max(10, Math.min(95, (baseLch.l || 50) - 30 + step)),
                    c: Math.max(10, (baseLch.c || 50) - 10 + (i * 5)) 
                });
            }
            break;
        case 'splitcomplement':
            // Base, Base+150, Base+210
            lchColors = [
                baseLch,
                { ...baseLch, h: (baseLch.h || 0) + 150 },
                { ...baseLch, h: (baseLch.h || 0) + 210 },
                { ...baseLch, l: (baseLch.l || 0) + 20 }, // Variation
                { ...baseLch, l: (baseLch.l || 0) - 20 }  // Variation
            ];
            break;
        case 'triad':
            // 0, 120, 240
            lchColors = [
                baseLch,
                { ...baseLch, h: (baseLch.h || 0) + 120 },
                { ...baseLch, h: (baseLch.h || 0) + 240 },
                { ...baseLch, l: (baseLch.l || 0) + 15, h: (baseLch.h || 0) + 120 },
                { ...baseLch, l: (baseLch.l || 0) - 15, h: (baseLch.h || 0) + 240 }
            ];
            break;
        case 'tetrad':
            // 0, 90, 180, 270
            lchColors = [
                baseLch,
                { ...baseLch, h: (baseLch.h || 0) + 90 },
                { ...baseLch, h: (baseLch.h || 0) + 180 },
                { ...baseLch, h: (baseLch.h || 0) + 270 },
                { ...baseLch, l: (baseLch.l || 0) + 20 }
            ];
            break;
        case 'doublecomplementary':
            // Two pairs
            lchColors = [
                 baseLch,
                 { ...baseLch, h: (baseLch.h || 0) + 180 },
                 { ...baseLch, h: (baseLch.h || 0) + 30 },
                 { ...baseLch, h: (baseLch.h || 0) + 210 },
                 { ...baseLch, l: (baseLch.l || 0) + 15 } // Highlight
            ];
            break;
        case 'complementary':
        default:
             // 0, 180
             lchColors = [
                 baseLch,
                 { ...baseLch, h: (baseLch.h || 0) + 180 },
                 { ...baseLch, l: (baseLch.l || 0) + 20 },
                 { ...baseLch, h: (baseLch.h || 0) + 180, l: (baseLch.l || 0) - 20 },
                 { ...baseLch, c: (baseLch.c || 0) * 0.5 } // desaturated var
             ];
             break;
    }

    // Apply logic to colors
    const finalPalette: Color[] = [];
    
    let generatedPool = lchColors.map(c => ({ ...c, mode: 'lch' } as CuloriColor));

    // Ensure we have enough
    while(generatedPool.length < PALETTE_SIZE) {
        generatedPool.push({ mode: 'lch', l: Math.random()*100, c: Math.random()*100, h: Math.random()*360 });
    }
    
    // Randomize pool order for variety if not monochromatic/analogous
    if (rule !== 'monochromatic' && rule !== 'analogous') {
        generatedPool = generatedPool.sort(() => Math.random() - 0.5);
    }

    const workingLchPalette: (CuloriColor | null)[] = new Array(PALETTE_SIZE).fill(null);

    // Place locked colors first
    currentPalette.forEach((c, i) => {
        if (c.isLocked) {
            workingLchPalette[i] = toLch(parse(c.hex)!);
        }
    });

    // Fill gaps
    let poolIndex = 0;
    for (let i = 0; i < PALETTE_SIZE; i++) {
        if (!workingLchPalette[i]) {
             const candidate = generatedPool[poolIndex % generatedPool.length];
             if (candidate.h) candidate.h = candidate.h % 360;
             workingLchPalette[i] = candidate;
             poolIndex++;
        }
    }
    
    let processedPalette = workingLchPalette as CuloriColor[];

    // Apply WCAG Correction
    processedPalette = processedPalette.map((c, i) => {
        if (currentPalette[i]?.isLocked) return c;
        return ensureContrastCompliance(c);
    });

    // Apply Simultaneous Contrast Adjustment
    const adjustedPalette = applySimultaneousContrast(processedPalette);
    
    // Revert locked colors
    currentPalette.forEach((c, i) => {
        if (c.isLocked) {
            adjustedPalette[i] = toLch(parse(c.hex)!);
        }
    });

    // Convert to final Color Objects
    const newColorObjects = adjustedPalette.map((lch, i) => {
        const hex = formatHex(lch);
        return createColorObject(hex, currentPalette[i]?.isLocked || false);
    });

    return { palette: newColorObjects, harmony: rule };
};
