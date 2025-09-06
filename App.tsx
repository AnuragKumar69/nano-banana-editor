import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { EditResult, editImage } from './services/geminiService';
import { MaskingCanvas } from './components/MaskingCanvas';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { BottomPanel } from './components/BottomPanel';
import { FitToScreenIcon } from './components/icons/FitToScreenIcon';


const dataUrlToParts = (dataUrl: string): { base64: string, mimeType: string } => {
    const parts = dataUrl.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const base64 = parts[1];
    return { base64, mimeType };
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

export default function App() {
    const [editHistory, setEditHistory] = useState<string[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(0);
    const [prompt, setPrompt] = useState<string>('');
    const [lastSuccessfulPrompt, setLastSuccessfulPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [modelResponseText, setModelResponseText] = useState<string | null>(null);
    const [key, setKey] = useState<number>(0);

    // Masking state
    const [isMasking, setIsMasking] = useState(false);
    const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
    const [maskBrushMode, setMaskBrushMode] = useState<'brush' | 'eraser'>('brush');
    const [brushSize, setBrushSize] = useState(35);
    const [canUndoMask, setCanUndoMask] = useState<boolean>(false);

    // Pan & Zoom state
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePositionRef = useRef({ x: 0, y: 0 });
    const mainContentRef = useRef<HTMLDivElement>(null);
    
    // Cursor Preview State
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isCursorVisible, setIsCursorVisible] = useState(false);


    const clearMaskRef = useRef<() => void>(null);
    const undoMaskRef = useRef<() => void>(null);


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
            setIsMasking(false);
            setMaskDataUrl(null);
            resetTransform();
        };
        reader.onerror = () => setError("Failed to read the image file.");
        reader.readAsDataURL(file);
    };

    const handleEditRequest = useCallback(async (
        currentPromptOverride?: string,
        isRegeneration = false
    ) => {
        const currentPrompt = currentPromptOverride ?? (isRegeneration ? lastSuccessfulPrompt : prompt);

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
            const maskBase64 = maskDataUrl ? dataUrlToParts(maskDataUrl).base64 : undefined;

            const result: EditResult = await editImage(base64, mimeType, currentPrompt, maskBase64);

            if (result.image) {
                const newImageDataUrl = `data:${result.image.mimeType};base64,${result.image.base64}`;
                const newHistory = editHistory.slice(0, activeHistoryIndex + 1);
                setEditHistory([...newHistory, newImageDataUrl]);
                setActiveHistoryIndex(newHistory.length);
                setLastSuccessfulPrompt(currentPrompt);
                if (!isRegeneration && !currentPromptOverride) setPrompt('');
                if (clearMaskRef.current) clearMaskRef.current(); 
                setMaskDataUrl(null);
                setIsMasking(false);
            }
            if (result.text) setModelResponseText(result.text);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, lastSuccessfulPrompt, editHistory, activeHistoryIndex, maskDataUrl]);

    const handleMagicErase = () => {
        if (!maskDataUrl) {
            setError("Please mask the area you want to remove first.");
            return;
        }
        handleEditRequest("Remove the object in the masked area and realistically fill in the background.");
    };

    const handleReset = () => {
        setEditHistory([]);
        setActiveHistoryIndex(0);
        setPrompt('');
        setLastSuccessfulPrompt('');
        setError(null);
        setModelResponseText(null);
        setIsMasking(false);
        setMaskDataUrl(null);
        setKey(prevKey => prevKey + 1);
    };

    const handleHistorySelect = (index: number) => {
        if (index >= 0 && index < editHistory.length) {
            setActiveHistoryIndex(index);
        }
    };

    const handleDeleteHistory = (indexToDelete: number) => {
        if (indexToDelete === 0) return; // Cannot delete original
    
        const newHistory = editHistory.filter((_, i) => i !== indexToDelete);
        let newActiveIndex = activeHistoryIndex;
    
        if (indexToDelete === activeHistoryIndex) {
            newActiveIndex = Math.max(0, indexToDelete - 1);
        } else if (indexToDelete < activeHistoryIndex) {
            newActiveIndex = activeHistoryIndex - 1;
        }
        
        setEditHistory(newHistory);
        setActiveHistoryIndex(newActiveIndex);
    };
    
    // --- Pan and Zoom Handlers ---
    const resetTransform = () => setTransform({ scale: 1, x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const { deltaY } = e;
        const scaleChange = -deltaY * 0.001;
        
        setTransform(prev => {
            const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.scale + scaleChange));
            return { ...prev, scale: newScale };
        });
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        // In mask mode, a primary click without Alt is for drawing. Let the canvas handle it.
        if (isMasking && e.button === 0 && !e.nativeEvent.altKey) {
            return;
        }

        const canPan = isMasking
            ? e.button === 1 || (e.button === 0 && e.nativeEvent.altKey) // Middle or Alt+Left
            : e.button === 0 || e.button === 1; // Left or Middle

        if (canPan) {
            e.preventDefault();
            setIsPanning(true);
            lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        if (isPanning) {
            const dx = e.clientX - lastMousePositionRef.current.x;
            const dy = e.clientY - lastMousePositionRef.current.y;
            setTransform(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy,
            }));
            lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
        }
    };
    
    const handleMouseUp = () => {
        setIsPanning(false);
    };

    // --- Undo/Redo ---
    const canUndo = activeHistoryIndex > 0;
    const canRedo = activeHistoryIndex < editHistory.length - 1;

    const handleUndo = useCallback(() => {
        if (canUndo) setActiveHistoryIndex(prev => prev - 1);
    }, [canUndo]);

    const handleRedo = useCallback(() => {
        if (canRedo) setActiveHistoryIndex(prev => prev + 1);
    }, [canRedo]);
    
     // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts if typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo();
                else handleUndo();
            }
             if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
                e.preventDefault();
                handleEditRequest(undefined, true);
            }
            if (e.key === 'm') {
                e.preventDefault();
                setIsMasking(m => !m);
            }
            if (isMasking) {
                if (e.key === 'b') { e.preventDefault(); setMaskBrushMode('brush'); }
                if (e.key === 'e') { e.preventDefault(); setMaskBrushMode('eraser'); }
                if (e.key === '[') { e.preventDefault(); setBrushSize(s => Math.max(5, s - 5)); }
                if (e.key === ']') { e.preventDefault(); setBrushSize(s => Math.min(100, s + 5)); }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, isMasking, handleEditRequest]);


    const currentImage = editHistory.length > 0 ? editHistory[activeHistoryIndex] : null;
    const cursorStyle = isMasking ? 'none' : isPanning ? 'grabbing' : 'grab';

    if (editHistory.length === 0) {
        return <ImageUploader key={key} onImageUpload={handleImageUpload} />;
    }

    return (
        <div className="w-screen h-screen flex flex-col font-sans bg-[#05070D] text-gray-200 fade-in">
            <div className="flex flex-grow overflow-hidden">
                {/* Left Sidebar */}
                <LeftSidebar
                    onReset={handleReset}
                    isMasking={isMasking}
                    onToggleMasking={() => setIsMasking(!isMasking)}
                    maskBrushMode={maskBrushMode}
                    onSetMaskBrushMode={setMaskBrushMode}
                    onUndoMask={() => undoMaskRef.current?.()}
                    canUndoMask={canUndoMask}
                    onMagicErase={handleMagicErase}
                    isMagicEraseDisabled={isLoading || !maskDataUrl}
                    currentImage={currentImage}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />

                {/* Main Content */}
                <main 
                    ref={mainContentRef}
                    className="flex-grow flex flex-col items-center justify-center relative p-8 select-none"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => {
                        handleMouseUp();
                        setIsCursorVisible(false);
                    }}
                    onMouseEnter={() => setIsCursorVisible(true)}
                    style={{ cursor: cursorStyle }}
                >
                     {isMasking && isCursorVisible && (
                        <div
                            className="fixed top-0 left-0 rounded-full pointer-events-none z-50"
                            style={{
                                border: `2px solid ${maskBrushMode === 'brush' ? 'white' : '#ef4444'}`,
                                backgroundColor: maskBrushMode === 'brush' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                mixBlendMode: 'normal',
                                width: `${brushSize}px`,
                                height: `${brushSize}px`,
                                transform: `translate3d(${mousePosition.x - brushSize / 2}px, ${mousePosition.y - brushSize / 2}px, 0)`,
                            }}
                        />
                    )}
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        <button
                            onClick={resetTransform}
                            className="absolute top-4 right-4 z-40 p-2 bg-gray-900/60 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                            title="Reset View"
                        >
                            <FitToScreenIcon className="w-5 h-5" />
                        </button>
                       <div className="w-full h-full relative group transition-transform duration-100" style={{ transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)` }}>
                            {isLoading && (
                                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30 rounded-xl">
                                    <Loader />
                                </div>
                            )}
                            {currentImage && (
                                <img src={currentImage} alt="Edited" className="w-full h-full object-contain rounded-xl shadow-2xl shadow-black/50" />
                            )}
                            {isMasking && currentImage && (
                                <MaskingCanvas 
                                    imageUrl={currentImage} 
                                    onMaskChange={setMaskDataUrl} 
                                    brushMode={maskBrushMode} 
                                    brushSize={brushSize}
                                    clearMaskRef={clearMaskRef} 
                                    undoMaskRef={undoMaskRef} 
                                    onUndoStateChange={setCanUndoMask}
                                    transform={transform}
                                />
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar */}
                <RightSidebar
                    history={editHistory}
                    activeIndex={activeHistoryIndex}
                    onSelectHistory={handleHistorySelect}
                    onDeleteHistory={handleDeleteHistory}
                    error={error}
                    modelResponseText={modelResponseText}
                />
            </div>

            {/* Bottom Panel */}
            <BottomPanel
                prompt={prompt}
                onPromptChange={setPrompt}
                onEditRequest={handleEditRequest}
                onRegenerate={() => handleEditRequest(undefined, true)}
                isMasking={isMasking}
                isLoading={isLoading}
                isRegenerateDisabled={isLoading || !lastSuccessfulPrompt}
                lastSuccessfulPrompt={lastSuccessfulPrompt}
            />
        </div>
    );
}