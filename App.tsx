import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { EditResult, editImage } from './services/geminiService';
import { PromptSuggestions } from './components/PromptSuggestions';
import { EditHistory } from './components/EditHistory';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { SparkleIcon } from './components/icons/SparkleIcon';
import { RedoIcon } from './components/icons/RedoIcon';


const dataUrlToParts = (dataUrl: string): { base64: string, mimeType: string } => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64 = parts[1];
    return { base64, mimeType };
};

export default function App() {
    const [editHistory, setEditHistory] = useState<string[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(0);
    const [prompt, setPrompt] = useState<string>('');
    const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [modelResponseText, setModelResponseText] = useState<string | null>(null);
    const [key, setKey] = useState<number>(0); // Used to reset file input

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setEditHistory([result]);
            setActiveHistoryIndex(0);
            setError(null);
            setModelResponseText(null);
            setPrompt('');
            setLastSuccessfulPrompt('');
        };
        reader.onerror = () => {
            setError("Failed to read the image file.");
        };
        reader.readAsDataURL(file);
    };

    const handleEditRequest = useCallback(async (useLastPrompt = false) => {
        const currentPrompt = useLastPrompt ? lastSuccessfulPrompt : prompt;
        
        if (!currentPrompt) {
            setError("Please provide an edit instruction.");
            return;
        }

        if (editHistory.length === 0) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setModelResponseText(null);

        try {
            const sourceImage = editHistory[activeHistoryIndex];
            const { base64, mimeType } = dataUrlToParts(sourceImage);
            const result: EditResult = await editImage(base64, mimeType, currentPrompt);

            if (result.image) {
                const newImageDataUrl = `data:${result.image.mimeType};base64,${result.image.base64}`;
                // Fork history if editing from a past state
                const newHistory = editHistory.slice(0, activeHistoryIndex + 1);
                setEditHistory([...newHistory, newImageDataUrl]);
                setActiveHistoryIndex(newHistory.length);
                setLastSuccessfulPrompt(currentPrompt);
                 if (!useLastPrompt) setPrompt('');
            }
            if (result.text) {
                setModelResponseText(result.text);
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, lastSuccessfulPrompt, editHistory, activeHistoryIndex]);
    
    const handleReset = () => {
        setEditHistory([]);
        setActiveHistoryIndex(0);
        setPrompt('');
        setLastSuccessfulPrompt('');
        setError(null);
        setModelResponseText(null);
        setKey(prevKey => prevKey + 1);
    };

    const handleHistorySelect = (index: number) => {
        setActiveHistoryIndex(index);
    };
    
    const originalImage = editHistory.length > 0 ? editHistory[0] : null;
    const currentImage = editHistory.length > 0 ? editHistory[activeHistoryIndex] : null;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
            <Header onReset={handleReset} showReset={!!originalImage} />

            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                {editHistory.length === 0 ? (
                    <ImageUploader key={key} onImageUpload={handleImageUpload} />
                ) : (
                    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div className="flex flex-col items-center">
                                <h2 className="text-xl font-semibold text-yellow-400 mb-3">Original</h2>
                                <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-800 border-2 border-gray-700 shadow-lg">
                                    <img src={originalImage ?? ''} alt="Original" className="w-full h-full object-contain" />
                                </div>
                            </div>
                           <div className="flex flex-col items-center">
                                <h2 className="text-xl font-semibold text-green-400 mb-3">Edited</h2>
                                <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-800 border-2 border-gray-700 shadow-lg relative group">
                                    {isLoading && <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10 rounded-lg"><Loader /></div>}
                                    <img src={currentImage ?? ''} alt="Edited" className="w-full h-full object-contain" />
                                    {currentImage && (
                                        <a
                                            href={currentImage}
                                            download={`edited-image-${Date.now()}.png`}
                                            className="absolute top-3 right-3 bg-gray-900/60 p-2 rounded-full text-white hover:bg-yellow-500 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 z-5"
                                            title="Download Image"
                                        >
                                            <DownloadIcon className="w-6 h-6" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {editHistory.length > 1 && (
                            <EditHistory
                                history={editHistory}
                                activeIndex={activeHistoryIndex}
                                onSelect={handleHistorySelect}
                            />
                        )}

                        <div className="w-full max-w-3xl space-y-4 mt-6">
                             <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'add a birthday hat' or 'make it a pop art painting'"
                                    className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none"
                                    rows={2}
                                    disabled={isLoading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleEditRequest(false);
                                        }
                                    }}
                                />
                            </div>

                            <PromptSuggestions onSelectPrompt={(p) => setPrompt(p)} />

                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => handleEditRequest(false)}
                                    disabled={isLoading || !prompt}
                                    className="flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                                >
                                    <SparkleIcon className="w-5 h-5" />
                                    <span>Generate</span>
                                </button>
                                 <button
                                    onClick={() => handleEditRequest(true)}
                                    disabled={isLoading || !lastSuccessfulPrompt}
                                    className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
                                    title={`Regenerate: "${lastSuccessfulPrompt}"`}
                                >
                                    <RedoIcon className="w-5 h-5" />
                                    <span>Regenerate</span>
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg animate-pulse">{error}</p>}
                            {modelResponseText && <p className="text-gray-300 text-center bg-gray-800 p-3 rounded-lg">{modelResponseText}</p>}
                        </div>
                    </div>
                )}
            </main>

            <footer className="text-center p-4 text-gray-500 text-sm">
                Powered by Gemini 2.5 Flash Image Preview (Nano Banana)
            </footer>
        </div>
    );
}