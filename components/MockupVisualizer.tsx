
import React, { useState } from 'react';
import { Color } from '../types';
import tinycolor from 'tinycolor2';

interface MockupVisualizerProps {
  palette: Color[];
}

type TemplateId = 'website' | 'dashboard' | 'poster' | 'cards';

const MOCKUP_TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: 'website',   label: 'Website',   description: 'Hero section and navigation.' },
  { id: 'dashboard', label: 'Dashboard', description: 'Analytics dashboard UI.' },
  { id: 'poster',    label: 'Poster',    description: 'Typography and shapes.' },
  { id: 'cards',     label: 'Cards',     description: 'Business cards layout.' },
];

const getColor = (palette: Color[], index: number, fallback: string): string => {
  return palette[index]?.hex || fallback;
};

const WebsiteMock: React.FC<{ palette: Color[] }> = ({ palette }) => {
  const p0 = getColor(palette, 0, '#0f172a');
  const p1 = getColor(palette, 1, '#38bdf8');
  const p2 = getColor(palette, 2, '#94a3b8');
  const p3 = getColor(palette, 3, '#e2e8f0');
  
  const navTextColor = tinycolor(p0).isDark() ? 'text-white' : 'text-gray-900';

  return (
    <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col font-sans">
      <div className={`h-14 flex items-center justify-between px-8 ${navTextColor}`} style={{ backgroundColor: p0 }}>
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-current opacity-20" />
           <div className="w-20 h-2 rounded-full bg-current opacity-40" />
        </div>
        <div className="flex gap-4 text-xs font-medium opacity-80">
           <div className="w-12 h-2 rounded-full bg-current opacity-30"></div>
           <div className="w-12 h-2 rounded-full bg-current opacity-30"></div>
           <div className="w-12 h-2 rounded-full bg-current opacity-30"></div>
        </div>
      </div>
      
      <div className="flex-1 flex">
         <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
             <span className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: p2 }}>New Collection</span>
             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">Design with <br/><span style={{ color: p1 }}>Confidence</span></h1>
             <div className="flex gap-3 mt-2">
                 <button className="px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ backgroundColor: p1 }}>Get Started</button>
                 <button className="px-6 py-2.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600">Learn More</button>
             </div>
         </div>
         <div className="w-1/3 bg-gray-50 relative overflow-hidden hidden sm:block">
             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: p3 }}></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-48 rounded-lg shadow-xl" style={{ backgroundColor: p1 }}></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-32 h-48 rounded-lg shadow-xl mix-blend-multiply opacity-80" style={{ backgroundColor: p2 }}></div>
         </div>
      </div>
    </div>
  );
};

const DashboardMock: React.FC<{ palette: Color[] }> = ({ palette }) => {
  const sidebar = getColor(palette, 0, '#1e293b');
  const active = getColor(palette, 1, '#3b82f6');
  const card1 = getColor(palette, 2, '#64748b');
  const card2 = getColor(palette, 3, '#94a3b8');
  const card3 = getColor(palette, 4, '#cbd5e1');

  const sidebarText = tinycolor(sidebar).isDark() ? 'text-white' : 'text-gray-900';

  return (
    <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-xl border border-gray-200 bg-gray-100 overflow-hidden shadow-sm flex">
      <div className="w-16 md:w-48 p-4 flex flex-col gap-4 transition-all" style={{ backgroundColor: sidebar }}>
         <div className={`h-8 w-8 rounded-lg bg-white/10 mb-4 ${sidebarText} flex items-center justify-center font-bold`}></div>
         <div className="space-y-3">
             <div className={`h-2 w-2/3 rounded-full bg-current opacity-20 ${sidebarText}`} />
             <div className={`h-2 w-1/2 rounded-full bg-current opacity-20 ${sidebarText}`} />
             <div className={`h-2 w-3/4 rounded-full bg-current opacity-20 ${sidebarText}`} />
         </div>
         <div className="mt-auto h-8 w-full rounded bg-white/5" />
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-6">
         <div className="flex justify-between items-center">
             <div className="h-4 w-32 bg-gray-300 rounded opacity-50" />
             <div className="h-8 w-8 rounded-full bg-gray-300 opacity-50" />
         </div>
         
         <div className="grid grid-cols-3 gap-4">
             {[card1, card2, card3].map((c, i) => (
                 <div key={i} className="bg-white p-4 rounded-lg shadow-sm border-t-4 flex flex-col gap-2" style={{ borderColor: c }}>
                     <div className="h-2 w-8 bg-gray-100 rounded" />
                     <div className="h-4 w-12 bg-gray-200 rounded" />
                 </div>
             ))}
         </div>
         
         <div className="flex-1 bg-white rounded-lg shadow-sm p-4 flex items-end gap-2 border border-gray-200">
             <div className="w-full bg-gray-50 h-full rounded flex items-end justify-around p-4 pb-0 gap-2 sm:gap-4">
                 <div className="w-full max-w-[30px] rounded-t opacity-80" style={{ height: '40%', backgroundColor: active }}></div>
                 <div className="w-full max-w-[30px] rounded-t opacity-80" style={{ height: '70%', backgroundColor: card1 }}></div>
                 <div className="w-full max-w-[30px] rounded-t opacity-80" style={{ height: '50%', backgroundColor: card2 }}></div>
                 <div className="w-full max-w-[30px] rounded-t opacity-80" style={{ height: '85%', backgroundColor: active }}></div>
                 <div className="w-full max-w-[30px] rounded-t opacity-80" style={{ height: '60%', backgroundColor: card3 }}></div>
             </div>
         </div>
      </div>
    </div>
  );
};

const PosterMock: React.FC<{ palette: Color[] }> = ({ palette }) => {
  const bg = getColor(palette, 0, '#000');
  const shape1 = getColor(palette, 1, '#f00');
  const shape2 = getColor(palette, 2, '#0f0');
  const shape3 = getColor(palette, 3, '#00f');
  
  const isBgDark = tinycolor(bg).isDark();
  const contrastText = isBgDark ? 'text-white' : 'text-gray-900';

  return (
    <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col sm:flex-row">
       <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: bg }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: shape1 }}></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-40 translate-y-1/3 -translate-x-1/4" style={{ backgroundColor: shape2 }}></div>
          
          <div className="relative z-10">
              <h1 className={`text-5xl font-black tracking-tighter leading-none mb-2 mix-blend-overlay ${contrastText}`} style={{ opacity: 0.9 }}>ART <br/>& DESIGN</h1>
              <p className={`text-xs font-mono uppercase tracking-widest opacity-60 ${contrastText}`}>Exhibition 2025</p>
          </div>
       </div>
       <div className="w-full sm:w-1/2 bg-gray-100 p-8 flex flex-col items-center justify-center relative">
           <div className="w-24 h-32 border-4 rounded-none relative" style={{ borderColor: shape3 }}>
               <div className="absolute top-3 -right-3 w-full h-full mix-blend-multiply opacity-80" style={{ backgroundColor: shape1 }}></div>
               <div className="absolute -bottom-3 -left-3 w-full h-full mix-blend-multiply opacity-80" style={{ backgroundColor: shape2 }}></div>
           </div>
       </div>
    </div>
  );
};

const CardsMock: React.FC<{ palette: Color[] }> = ({ palette }) => {
    return (
        <div className="w-full aspect-[16/9] md:aspect-[2/1] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm p-4 sm:p-8 flex items-center justify-center bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                {palette.slice(0, 4).map((c, i) => {
                    const isDark = tinycolor(c.hex).isDark();
                    const txt = isDark ? 'text-white' : 'text-gray-900';
                    return (
                        <div key={i} className="aspect-[3/2] rounded-lg shadow-md flex flex-col justify-between p-4 transform hover:-translate-y-1 transition-transform bg-white border-t-4" style={{ backgroundColor: i % 2 === 0 ? c.hex : 'white', borderColor: c.hex }}>
                            <div className={`w-6 h-6 rounded-full opacity-20 ${i % 2 === 0 ? 'bg-current ' + txt : ''}`} style={{ backgroundColor: i % 2 !== 0 ? c.hex : undefined }} />
                            <div>
                                <div className={`h-2 w-12 rounded-full opacity-40 mb-1 ${i % 2 === 0 ? 'bg-current ' + txt : 'bg-gray-300'}`} />
                                <div className={`h-2 w-8 rounded-full opacity-20 ${i % 2 === 0 ? 'bg-current ' + txt : 'bg-gray-200'}`} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const MockupVisualizer: React.FC<MockupVisualizerProps> = ({ palette }) => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('website');

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto flex flex-col min-h-full">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Palette Visualizer</h2>
                <p className="text-gray-500 max-w-2xl">
                    Preview your palette on common user interface patterns instantly.
                </p>
             </div>
             
             <div className="flex flex-col items-end gap-2">
                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex overflow-x-auto max-w-full">
                    {MOCKUP_TEMPLATES.map((tpl) => (
                        <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setActiveTemplate(tpl.id)}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                                activeTemplate === tpl.id 
                                    ? 'bg-[#1982c4] text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {tpl.label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 text-right pr-1">
                    {MOCKUP_TEMPLATES.find(t => t.id === activeTemplate)?.description}
                </p>
             </div>
          </div>

          {/* Palette Strip */}
          <div className="mb-8 flex rounded-xl overflow-hidden shadow-sm border border-gray-200 h-16">
              {palette.map((c, i) => (
                  <div key={i} className="flex-1 h-full relative group" style={{ backgroundColor: c.hex }}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity backdrop-blur-[1px]">
                          <span className={`text-xs font-bold font-mono uppercase tracking-widest ${tinycolor(c.hex).isDark() ? 'text-white' : 'text-black'}`}>{c.hex}</span>
                      </div>
                  </div>
              ))}
          </div>

          {/* Visualizer Area */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 p-4 md:p-8 flex items-center justify-center">
              {activeTemplate === 'website' && <WebsiteMock palette={palette} />}
              {activeTemplate === 'dashboard' && <DashboardMock palette={palette} />}
              {activeTemplate === 'poster' && <PosterMock palette={palette} />}
              {activeTemplate === 'cards' && <CardsMock palette={palette} />}
          </div>
          
          <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">Colors are mapped sequentially from your palette to the UI elements above.</p>
          </div>

      </div>
    </div>
  );
};

export default MockupVisualizer;
