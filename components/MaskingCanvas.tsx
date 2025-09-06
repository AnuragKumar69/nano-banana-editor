import React, { useRef, useEffect, useState, RefObject } from 'react';

interface MaskingCanvasProps {
    imageUrl: string;
    onMaskChange: (dataUrl: string | null) => void;
    brushMode: 'brush' | 'eraser';
    brushSize: number;
    clearMaskRef: RefObject<() => void>;
    undoMaskRef: RefObject<() => void>;
    onUndoStateChange: (canUndo: boolean) => void;
    transform: { scale: number; x: number; y: number };
}

export const MaskingCanvas: React.FC<MaskingCanvasProps> = ({ imageUrl, onMaskChange, brushMode, brushSize, clearMaskRef, undoMaskRef, onUndoStateChange, transform }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
    };
    
    const saveState = () => {
        const ctx = getCanvasContext();
        if(!ctx || !canvasRef.current) return;
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHistory(prev => [...prev, imageData]);
        onUndoStateChange(true);
    };

    const undo = () => {
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory.pop(); // Remove the last state
            
            const ctx = getCanvasContext();
            if(ctx && canvasRef.current) {
                if(newHistory.length > 0) {
                    const lastState = newHistory[newHistory.length - 1];
                    ctx.putImageData(lastState, 0, 0);
                } else {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }

            onUndoStateChange(newHistory.length > 0);
            stopDrawing(true);
            return newHistory;
        });
    };
    
    const clearCanvas = () => {
        const ctx = getCanvasContext();
        const canvas = canvasRef.current;
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHistory([]);
            onUndoStateChange(false);
            onMaskChange(null);
        }
    };
    
    useEffect(() => {
        if (clearMaskRef) (clearMaskRef as React.MutableRefObject<() => void>).current = clearCanvas;
        if (undoMaskRef) (undoMaskRef as React.MutableRefObject<() => void>).current = undo;
    }, [clearMaskRef, undoMaskRef]);


    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                 const { width, height } = canvas.getBoundingClientRect();
                 canvas.width = width;
                 canvas.height = height;
                 clearCanvas();
            }
        };
    }, [imageUrl]);

    const getCoords = (e: React.MouseEvent | MouseEvent | Touch): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        // Correctly calculate canvas coordinates from viewport coordinates
        // by accounting for the element's transformed position and scale.
        const x = (e.clientX - rect.left) / transform.scale;
        const y = (e.clientY - rect.top) / transform.scale;
        
        return { x, y };
    };
    
    const startDrawing = (e: React.MouseEvent) => {
        const coords = getCoords(e);
        if (!coords) return;
        setIsDrawing(true);
        const ctx = getCanvasContext();
        if(ctx) {
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
        draw(e); 
    };

    const stopDrawing = (isHistoryChange = false) => {
        if (!isDrawing && !isHistoryChange) return;
        setIsDrawing(false);

        if (!isHistoryChange) {
             saveState();
        }

        const canvas = canvasRef.current;
        if (canvas) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            if (!tempCtx) {
                onMaskChange(null);
                return;
            }
    
            tempCtx.drawImage(canvas, 0, 0);
    
            try {
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                const data = imageData.data;
                let hasMaskContent = false;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 10) { 
                        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255; 
                        hasMaskContent = true;
                    } else {
                        data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
                    }
                }
                tempCtx.putImageData(imageData, 0, 0);
    
                onMaskChange(hasMaskContent ? tempCanvas.toDataURL('image/png') : null);
    
            } catch (e) {
                console.error("Failed to process mask canvas data:", e);
                onMaskChange(null);
            }
        }
    };

    const draw = (e: React.MouseEvent | MouseEvent) => {
        if (!isDrawing) return;
        const ctx = getCanvasContext();
        const coords = getCoords(e);
        if (!ctx || !coords) return;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (brushMode === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        } else { 
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        }
        
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };
    
    return (
        <canvas
            ref={canvasRef}
            onMouseDown={(e) => { e.stopPropagation(); startDrawing(e); }}
            onMouseUp={() => stopDrawing()}
            onMouseLeave={() => stopDrawing()}
            onMouseEnter={(e) => {
                // If mouse button is still pressed (e.g., entered canvas while dragging), continue drawing
                if (e.buttons === 1) {
                    startDrawing(e);
                }
            }}
            onMouseMove={draw}
            className={`absolute top-0 left-0 w-full h-full z-20 rounded-xl pointer-events-auto`}
        />
    );
};