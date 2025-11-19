
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, AppView, GeneratedImage } from './types';
import { generatePalette, createColorObject } from './utils/colorUtils';
import { generateImage as generateImageService, extractPaletteFromImage as extractPaletteFromImageService } from './services/geminiService';
import Header from './components/Header';
import ColorPalette from './components/ColorPalette';
import ImageGenerator from './components/ImageGenerator';
import FavoritesPanel from './components/FavoritesPanel';
import AccountModal from './components/AccountModal';
import TrendingPage from './components/TrendingPage';
import tinycolor from 'tinycolor2';

interface HistoryState {
  palette: Color[];
  harmony: string | null;
}

const App: React.FC = () => {
  const [palette, setPalette] = useState<Color[]>([]);
  const [harmony, setHarmony] = useState<string | null>(null);
  const [appView, setAppView] = useState<AppView>(AppView.Palette);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [baseColorForContrast, setBaseColorForContrast] = useState<string | null>(null);
  const [favoritePalettes, setFavoritePalettes] = useState<string[][]>([]);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedImagePreview, setImportedImagePreview] = useState<string | null>(null);
  
  // Transition State for Shutter Effect
  const [previousPalette, setPreviousPalette] = useState<Color[]>([]);
  const [transitionId, setTransitionId] = useState<number>(0);
  
  // Account State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Undo/Redo State
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Image Generation History
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);

  const initialPaletteGenerated = useRef(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favoritePalettes');
      if (savedFavorites) {
        setFavoritePalettes(JSON.parse(savedFavorites));
      }
      const savedImages = localStorage.getItem('imageHistory');
      if (savedImages) {
        setImageHistory(JSON.parse(savedImages));
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
    try {
        localStorage.setItem('imageHistory', JSON.stringify(imageHistory));
    } catch (e) {
        console.error("Failed to save image history", e);
    }
  }, [imageHistory]);
  
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

  const handleUndo = useCallback(() => {
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      // Trigger transition for Undo
      setPreviousPalette(palette);
      setTransitionId(prev => prev + 1);

      setFuture(prev => [{ palette, harmony }, ...prev]);
      setPalette(previous.palette);
      setHarmony(previous.harmony);
      setPast(newPast);
      setBaseColorForContrast(null);
  }, [past, palette, harmony]);

  const handleRedo = useCallback(() => {
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);

      // Trigger transition for Redo
      setPreviousPalette(palette);
      setTransitionId(prev => prev + 1);

      setPast(prev => {
          const newPast = [...prev, { palette, harmony }];
          return newPast.length > 3 ? newPast.slice(newPast.length - 3) : newPast;
      });
      setPalette(next.palette);
      setHarmony(next.harmony);
      setFuture(newFuture);
      setBaseColorForContrast(null);
  }, [future, palette, harmony]);

  // Trigger state update and force remount for transition
  const animatePaletteUpdate = useCallback((updateAction: () => void) => {
      setPreviousPalette(palette);
      setTransitionId(prev => prev + 1);
      updateAction();
  }, [palette]);

  // Callback to clean up previous palette AFTER animation completes
  // This prevents the "End Flash" by ensuring overlay isn't removed until invisible
  const handleTransitionComplete = useCallback(() => {
      setPreviousPalette([]);
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

    if (event.code === 'Space' && !isInputActive) {
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
  }, [createNewPalette, handleUndo, handleRedo]);

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
  
  const handleGenerateMockup = async (prompt: string, image?: { data: string; mimeType: string }) => {
      setIsLoading(true);
      setError(null);
      try {
          const result = await generateImageService(prompt, image);
          const newImage: GeneratedImage = {
              id: Date.now().toString(),
              prompt,
              data: `data:image/png;base64,${result}`,
              timestamp: Date.now()
          };
          setImageHistory(prev => [newImage, ...prev]);
          setIsLoading(false);
          return newImage.data;
      } catch (e) {
          setError("Failed to generate image.");
          setIsLoading(false);
          return null;
      }
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
                isTransitioning={false} 
                onTransitionComplete={handleTransitionComplete}
            />
        )}
        
        {appView === AppView.Image && (
             <ImageGenerator 
                palette={palette}
                onGenerate={handleGenerateMockup}
                isLoading={isLoading}
                error={error}
                imageHistory={imageHistory}
             />
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
