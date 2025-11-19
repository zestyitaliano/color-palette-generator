
import React, { useState, useRef } from 'react';
import { UploadCloudIcon, XIcon, HistoryIcon, DownloadIcon } from './icons/Icons';
import { GeneratedImage, Color } from '../types';

interface ImageGeneratorProps {
  palette: Color[];
  onGenerate: (prompt: string, image?: { data: string; mimeType: string }) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  imageHistory: GeneratedImage[];
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ palette, onGenerate, isLoading, error, imageHistory }) => {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setUploadedImage({
          data: base64Data,
          mimeType: file.type,
          previewUrl: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !industry || isLoading) return;
    
    const hexString = palette.map(c => c.hex).join(', ');
    
    const prompt = `Create a professional, photorealistic brand identity mockup for a company named "${brandName}" operating in the ${industry} industry. 
    The design MUST strictly use the following color palette: ${hexString}. 
    The image should feature a logo visualization, business cards, and stationery items arranged in an elegant flat-lay composition on a neutral background. 
    The style should be modern, high-end, and cohesive. 4k resolution, cinematic lighting.`;

    const imagePayload = uploadedImage ? { data: uploadedImage.data, mimeType: uploadedImage.mimeType } : undefined;
    const result = await onGenerate(prompt, imagePayload);
    if (result) {
        setGeneratedImage(result);
    }
  };

  const handleSelectHistoryItem = (item: GeneratedImage) => {
      setGeneratedImage(item.data);
      // We don't fill the form back because the prompt in history is the full generated prompt
  };

  const handleDownload = () => {
      if (!generatedImage) return;
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `color-palette-generator-mockup-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="w-full flex justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-4xl flex flex-col items-center gap-6 bg-[#efefef] shadow-lg border border-gray-200 p-4 md:p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">Brand Mockup Generator</h2>
        <p className="text-gray-600 text-center max-w-lg">Visualize your palette in a real-world context. Generate a professional brand identity package including logo concepts and stationery.</p>
        
        <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full md:w-1/3 p-4 border border-gray-300 flex flex-col items-center justify-center text-center bg-white">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Active Palette</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                    {palette.map((c) => (
                        <div key={c.hex} className="w-8 h-8 border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} title={c.hex} />
                    ))}
                </div>
            </div>

            <div className="w-full md:w-2/3 p-4 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-center bg-gray-50">
                {uploadedImage ? (
                <div className="relative">
                    <p className="text-sm text-gray-500 mb-2">Logo / Reference Image:</p>
                    <img src={uploadedImage.previewUrl} alt="Inspiration preview" className="max-h-32 shadow-sm" />
                    <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
                    aria-label="Remove inspiration image"
                    >
                    <XIcon className="w-4 h-4" />
                    </button>
                </div>
                ) : (
                <>
                    <p className="text-gray-600 mb-2">Optional: Upload an existing logo or sketch</p>
                    <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    />
                    <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 font-semibold shadow-sm hover:bg-gray-50 transition-colors"
                    >
                    <UploadCloudIcon />
                    Upload Reference
                    </button>
                </>
                )}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 uppercase font-bold mb-1 ml-1">Brand Name</label>
                    <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g., Nebula Tech"
                    className="w-full bg-white border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-[#1982c4] transition-all"
                    disabled={isLoading}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 uppercase font-bold mb-1 ml-1">Industry & Vibe</label>
                    <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Sustainable Coffee, Minimalist"
                    className="w-full bg-white border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-[#1982c4] transition-all"
                    disabled={isLoading}
                    />
                </div>
            </div>
            
            <button
            type="submit"
            disabled={isLoading || !brandName || !industry}
            className="w-full py-4 bg-[#1982c4] text-white font-bold text-lg shadow-lg hover:bg-[#156fba] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] transition-all duration-200"
            >
            {isLoading ? 'Designing Brand Package...' : 'Generate Mockup'}
            </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="w-full aspect-video bg-gray-200 mt-4 flex items-center justify-center border-2 border-dashed border-gray-400 relative overflow-hidden group">
            {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="animate-spin h-8 w-8 text-[#1982c4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Rendering brand assets...</span>
            </div>
            ) : generatedImage ? (
                <>
                    <img src={generatedImage} alt="Generated Mockup" className="w-full h-full object-contain bg-white" />
                    <button 
                        onClick={handleDownload}
                        className="absolute top-4 right-4 p-3 bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 shadow-lg"
                        title="Download Image"
                    >
                        <DownloadIcon />
                    </button>
                </>
            ) : (
            <div className="text-center p-8">
                <p className="text-gray-500 mb-2">Your mockup will appear here</p>
                <p className="text-gray-400 text-sm">Enter your brand details above to start</p>
            </div>
            )}
        </div>

        {/* Image History Section */}
        {imageHistory.length > 0 && (
            <div className="w-full mt-8">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <HistoryIcon className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Previous Mockups</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imageHistory.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => handleSelectHistoryItem(item)}
                            className="cursor-pointer group relative aspect-square overflow-hidden border border-gray-300 hover:border-[#1982c4] transition-all shadow-sm hover:shadow-md"
                        >
                            <img src={item.data} alt="History item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                <p className="text-xs text-white line-clamp-2">{new Date(item.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </div>
    </div>
  );
};

export default ImageGenerator;
