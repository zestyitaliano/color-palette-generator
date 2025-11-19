
import React from 'react';

interface HarmonyVisualizerProps {
  harmony: string | null;
}

const SVGWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-20 h-20 flex-shrink-0" aria-hidden="true">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-300" />
        {children}
    </svg>
);

const Dot: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
    <circle cx={cx} cy={cy} r="6" fill="currentColor" className="text-[#1982c4]" />
);

const HarmonyVisualizer: React.FC<HarmonyVisualizerProps> = ({ harmony }) => {
    switch (harmony) {
        case 'analogous':
            return (
                <SVGWrapper>
                    <path d="M 27.5 11 L 50 5 L 72.5 11" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={50} cy={5} />
                    <Dot cx={27.5} cy={11} />
                    <Dot cx={72.5} cy={11} />
                </SVGWrapper>
            );
        case 'monochromatic':
             return (
                <SVGWrapper>
                    <defs>
                        <linearGradient id="monoGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" className="text-blue-200" />
                            <stop offset="100%" stopColor="currentColor" className="text-[#1982c4]" />
                        </linearGradient>
                    </defs>
                    <path d="M50 50 L50 5" stroke="url(#monoGradient)" strokeWidth="12" />
                </SVGWrapper>
            );
        case 'splitcomplement':
            return (
                <SVGWrapper>
                    <path d="M50 5 L27.5 89 L72.5 89 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={50} cy={5} />
                    <Dot cx={27.5} cy={89} />
                    <Dot cx={72.5} cy={89} />
                </SVGWrapper>
            );
        case 'triad':
            return (
                <SVGWrapper>
                     <path d="M50 5 L11 72.5 L89 72.5 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={50} cy={5} />
                    <Dot cx={11} cy={72.5} />
                    <Dot cx={89} cy={72.5} />
                </SVGWrapper>
            );
        case 'tetrad':
            return (
                <SVGWrapper>
                    <path d="M27.5 11 L72.5 11 L72.5 89 L27.5 89 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={27.5} cy={11} />
                    <Dot cx={72.5} cy={11} />
                    <Dot cx={27.5} cy={89} />
                    <Dot cx={72.5} cy={89} />
                </SVGWrapper>
            );
        case 'complementary':
            return (
                <SVGWrapper>
                    <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={50} cy={5} />
                    <Dot cx={50} cy={95} />
                </SVGWrapper>
            );
        case 'doublecomplementary': // Square
            return (
                <SVGWrapper>
                    <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400" />
                    <Dot cx={50} cy={5} />
                    <Dot cx={95} cy={50} />
                    <Dot cx={50} cy={95} />
                    <Dot cx={5} cy={50} />
                </SVGWrapper>
            );
        default:
            return <SVGWrapper><Dot cx={50} cy={50}/></SVGWrapper>;
    }
};

export default HarmonyVisualizer;
