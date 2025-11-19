
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, AppView } from './types';
import { generatePalette, createColorObject } from './utils/colorUtils';
import { extractPaletteFromImage as extractPaletteFromImageService } from './services/geminiService';
import Header from './components/Header';
import ColorPalette from './components/ColorPalette';
import MockupVisualizer from './components/MockupVisualizer';
import FavoritesPanel from './components/FavoritesPanel';
import AccountModal from './components/AccountModal';
import TrendingPage from './components/TrendingPage';
import GradientPage from './components/GradientPage';
import ImageRecolorPage from './components/ImageRecolorPage';

interface HistoryState {
  palette: Color[];
  harmony: string | null;
}

const App: React.FC = () => {
  const [palette, setPalette] = useState<Color[]>([]);
  const [harmony, setHarmony] = useState<string | null>(null);
  const [appView, setAppView] = useState<AppView>(AppView.Palette);
  const [baseColorForContrast, setBaseColorForContrast] = useState<string | null>(null);
  const [favoritePalettes, setFavoritePalettes] = useState<string[][]>([]);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedImagePreview, setImportedImagePreview] = useState<string | null>(null);
  
  // Transition State for Shutter Effect
  const [previousPalette, setPreviousPalette] = useState<Color[]>([]);
  const [transitionId, setTransitionId] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Account State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Undo/Redo State
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  const initialPaletteGenerated = useRef(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoritePalettes');
      if (savedFavorites) {
        setFavoritePalettes(JSON.parse(savedFavorites));
      }
      const savedUser = localStorage.getItem('userSession');
      if (savedUser) {
          setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('favoritePalettes', JSON.stringify(favoritePalettes));
    } catch (e) {
      console.error("Failed to save favorite palettes", e);
    }
  }, [favoritePalettes]);
  
  useEffect(() => {
      if (user) {
          localStorage.setItem('userSession', JSON.stringify(user));
      } else {
          localStorage.removeItem('userSession');
      }
  }, [user]);

  // Helper to update state with history tracking
  const updatePaletteState = useCallback((newPalette: Color[], newHarmony: string | null, skipHistory: boolean = false) => {
      if (!skipHistory) {
          setPast(prev => {
              const newPast = [...prev, { palette, harmony }];
              return newPast.length > 3 ? newPast.slice(newPast.length - 3) : newPast;
          });
          setFuture([]);
      }
      setPalette(newPalette);
      setHarmony(newHarmony);
  }, [palette, harmony]);

  // Trigger state update and force remount for transition
  const animatePaletteUpdate = useCallback((updateAction: () => void) => {
      if (isTransitioning) return;

      setIsTransitioning(true);
      setPreviousPalette(palette);
      setTransitionId(prev => prev + 1);
      updateAction();
  }, [palette, isTransitioning]);

  const handleUndo = useCallback(() => {
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      animatePaletteUpdate(() => {
          setFuture(prev => [{ palette, harmony }, ...prev]);
          setPalette(previous.palette);
          setHarmony(previous.harmony);
          setPast(newPast);
          setBaseColorForContrast(null);
      });
  }, [past, palette, harmony, animatePaletteUpdate]);

  const handleRedo = useCallback(() => {
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);

      animatePaletteUpdate(() => {
          setPast(prev => {
              const newPast = [...prev, { palette, harmony }];
              return newPast.length > 3 ? newPast.slice(newPast.length - 3) : newPast;
          });
          setPalette(next.palette);
          setHarmony(next.harmony);
          setFuture(newFuture);
          setBaseColorForContrast(null);
      });
  }, [future, palette, harmony, animatePaletteUpdate]);

  // Callback to clean up previous palette AFTER animation completes
  const handleTransitionComplete = useCallback(() => {
      setPreviousPalette([]);
      setIsTransitioning(false);
  }, []);

  const createNewPalette = useCallback((specificHarmony?: string) => {
    animatePaletteUpdate(() => {
        const { palette: newPalette, harmony: newHarmony } = generatePalette(palette, specificHarmony);
        updatePaletteState(newPalette, newHarmony);
        setBaseColorForContrast(null); 
        setImportedImagePreview(null);
    });
  }, [palette, updatePaletteState, animatePaletteUpdate]);

  useEffect(() => {
    if (!initialPaletteGenerated.current) {
        const { palette: newPalette, harmony: newHarmony } = generatePalette([]);
        setPalette(newPalette);
        setHarmony(newHarmony);
        initialPaletteGenerated.current = true;
    }
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInputActive = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

    if (event.code === 'Space' && !isInputActive && appView === AppView.Palette) {
      event.preventDefault();
      createNewPalette();
    }
    
    if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !isInputActive) {
        event.preventDefault();
        if (event.shiftKey) {
            handleRedo();
        } else {
            handleUndo();
        }
    }
  }, [createNewPalette, handleUndo, handleRedo, appView]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  
  const handleToggleLock = (hex: string) => {
    const newPalette = palette.map(color =>
        color.hex === hex ? { ...color, isLocked: !color.isLocked } : color
    );
    updatePaletteState(newPalette, harmony);
  };

  const handleUpdateColor = (index: number, newHex: string) => {
    const newPalette = [...palette];
    if (newPalette[index]) {
        newPalette[index] = createColorObject(newHex, newPalette[index].isLocked);
        updatePaletteState(newPalette, harmony);
    }
  };

  const handleExtractFromImage = async (file: File) => {
      if (!file) return;
      setIsImporting(true);
      setImportError(null);
      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64Data = (reader.result as string).split(',')[1];
              const mimeType = file.type;
              setImportedImagePreview(reader.result as string);
              
              const hexColors = await extractPaletteFromImageService({ data: base64Data, mimeType });
              
              animatePaletteUpdate(() => {
                  const newPaletteColors = hexColors.map(hex => createColorObject(hex));
                  updatePaletteState(newPaletteColors, 'imported');
              });
              setAppView(AppView.Palette);
          };
          reader.readAsDataURL(file);
      } catch (err) {
          setImportError("Failed to extract colors.");
          console.error(err);
      } finally {
          setIsImporting(false);
      }
  };

  const handleExtractFromImageUrl = async (url: string) => {
      setIsImporting(true);
      setImportError(null);
      try {
          const response = await fetch(url);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = async () => {
               const base64Data = (reader.result as string).split(',')[1];
               setImportedImagePreview(reader.result as string);
               const hexColors = await extractPaletteFromImageService({ data: base64Data, mimeType: blob.type });
               animatePaletteUpdate(() => {
                  const newPaletteColors = hexColors.map(hex => createColorObject(hex));
                  updatePaletteState(newPaletteColors, 'imported');
              });
              setAppView(AppView.Palette);
          };
          reader.readAsDataURL(blob);
      } catch (e) {
          setImportError("Could not load image from URL");
      } finally {
          setIsImporting(false);
      }
  };

  const handleReorderPalette = (newPalette: Color[]) => {
       updatePaletteState(newPalette, harmony);
  };

  const handleToggleFavorite = () => {
      const currentHexes = palette.map(c => c.hex);
      const exists = favoritePalettes.some(p => JSON.stringify(p) === JSON.stringify(currentHexes));
      if (exists) {
          setFavoritePalettes(prev => prev.filter(p => JSON.stringify(p) !== JSON.stringify(currentHexes)));
      } else {
          setFavoritePalettes(prev => [currentHexes, ...prev]);
      }
  };
  
  const loadFavorite = (favPalette: string[]) => {
      animatePaletteUpdate(() => {
          const newColors = favPalette.map(hex => createColorObject(hex));
          updatePaletteState(newColors, null);
      });
      setAppView(AppView.Palette);
      setIsFavoritesPanelOpen(false);
  };
  
  const deleteFavorite = (favPalette: string[]) => {
      setFavoritePalettes(prev => prev.filter(p => JSON.stringify(p) !== JSON.stringify(favPalette)));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header 
        activeView={appView} 
        setAppView={setAppView} 
        onToggleFavoritesPanel={() => setIsFavoritesPanelOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        isLoggedIn={!!user}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {appView === AppView.Palette && (
            <ColorPalette 
                palette={palette}
                previousPalette={previousPalette}
                transitionId={transitionId}
                onToggleLock={handleToggleLock}
                generateNewPalette={createNewPalette}
                harmony={harmony}
                baseColorForContrast={baseColorForContrast}
                onSetBaseColor={setBaseColorForContrast}
                isCurrentPaletteFavorite={favoritePalettes.some(p => JSON.stringify(p) === JSON.stringify(palette.map(c => c.hex)))}
                onToggleFavorite={handleToggleFavorite}
                onExtractFromImage={handleExtractFromImage}
                onExtractFromImageUrl={handleExtractFromImageUrl}
                isImporting={isImporting}
                importError={importError}
                onReorderPalette={handleReorderPalette}
                importedImagePreview={importedImagePreview}
                onUpdateColor={handleUpdateColor}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isTransitioning={isTransitioning} 
                onTransitionComplete={handleTransitionComplete}
            />
        )}
        
        {appView === AppView.Image && (
             <MockupVisualizer palette={palette} />
        )}

        {appView === AppView.Trending && (
            <TrendingPage onLoadPalette={(colors) => {
                animatePaletteUpdate(() => {
                    const newPalette = colors.map(hex => createColorObject(hex));
                    updatePaletteState(newPalette, 'trending');
                    setAppView(AppView.Palette);
                });
            }} />
        )}

        {appView === AppView.Gradients && (
            <GradientPage 
                onLoadPalette={(colors) => {
                    animatePaletteUpdate(() => {
                        const newPalette = colors.map(hex => createColorObject(hex));
                        updatePaletteState(newPalette, 'gradient');
                        setAppView(AppView.Palette);
                    });
                }} 
                currentPalette={palette.map(c => c.hex)}
            />
        )}

        {appView === AppView.ImageRecolor && (
            <ImageRecolorPage currentPalette={palette.map(c => c.hex)} />
        )}
      </main>

      <FavoritesPanel 
        isOpen={isFavoritesPanelOpen} 
        onClose={() => setIsFavoritesPanelOpen(false)}
        palettes={favoritePalettes}
        onSelect={loadFavorite}
        onDelete={deleteFavorite}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        onLogin={(email) => setUser({ email })}
        onLogout={() => setUser(null)}
      />
    </div>
  );
};

export default App;
