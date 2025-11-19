
import React from 'react';
import tinycolor from 'tinycolor2';
import { Color } from '../types';

interface ColorWheelProps {
  palette: Color[];
  harmony: string | null;
}

const SVG_SIZE = 200;
const CENTER = SVG_SIZE / 2;
const WHEEL_RADIUS = 80;
const DOT_RADIUS = 8;

const getCoordinatesForColor = (hex: string, radius: number): { x: number; y: number } => {
  const { h } = tinycolor(hex).toHsl();
  const angle = (h - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;       
};


const WheelSlice: React.FC<{ index: number }> = React.memo(({ index }) => {
  const startAngle = index;
  const endAngle = index + 1.5; // Overlap slightly to avoid gaps
  const pathData = describeArc(CENTER, CENTER, WHEEL_RADIUS, startAngle, endAngle);
  return (
    <path
      d={pathData}
      fill="none"
      stroke={`hsl(${index}, 90%, 60%)`}
      strokeWidth={25}
    />
  );
});


const ColorWheel: React.FC<ColorWheelProps> = ({ palette, harmony }) => {
  if (palette.length === 0) {
    return null;
  }
  
  const uniqueHues = [...new Map(palette.map(c => [tinycolor(c.hex).toHsl().h, c])).values()];
  // FIX: Add explicit type `Color` to the `color` parameter to resolve a TypeScript type inference issue.
  const colorPositions = uniqueHues.map((color: Color) => getCoordinatesForColor(color.hex, WHEEL_RADIUS));

  const createConnectionPath = () => {
    if (colorPositions.length < 2 || harmony === 'monochromatic') return "";
    
    // For harmonies like triad, tetrad, etc., connect all points to form a closed shape
    if (['triad', 'tetrad', 'splitcomplement', 'doublecomplementary'].includes(harmony || '')) {
       return `M ${colorPositions.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    }
    // For others like complementary, just connect them
    return `M ${colorPositions.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }
  
  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm text-[#1982c4] uppercase font-semibold tracking-wider mb-2">Color Wheel</h4>
      <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-40 h-40" aria-label="Color wheel showing the relationship of the palette colors">
        <g>
          {Array.from({ length: 360 }).map((_, i) => (
            <WheelSlice key={i} index={i} />
          ))}
        </g>
        
        {/* Harmony connection lines */}
        {colorPositions.length > 1 && (
             <path
                d={createConnectionPath()}
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth="2"
                fill={colorPositions.length > 2 ? "rgba(0, 0, 0, 0.05)" : "none"}
                strokeDasharray="4 4"
             />
        )}

        {/* Color dots */}
        {palette.map((color) => {
          const position = getCoordinatesForColor(color.hex, WHEEL_RADIUS);
          return (
            <circle
              key={color.hex}
              cx={position.x}
              cy={position.y}
              r={DOT_RADIUS}
              fill={color.hex}
              stroke={tinycolor(color.hex).isDark() ? "#FFFFFF" : "#000000"}
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ColorWheel;