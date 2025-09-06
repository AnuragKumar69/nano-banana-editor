import React from 'react';
import { ResetIcon } from './icons/ResetIcon';
import { BrushIcon } from './icons/BrushIcon';
import { EraserIcon } from './icons/EraserIcon';
import { UndoIcon } from './icons/UndoIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { AppIcon } from './icons/AppIcon';
import { RedoIcon } from './icons/RedoIcon';
import { AutoDetectIcon } from './icons/AutoDetectIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LeftSidebarProps {
    onReset: () => void;
    isMasking: boolean;
    onToggleMasking: () => void;
    maskBrushMode: 'brush' | 'eraser';
    onSetMaskBrushMode: (mode: 'brush' | 'eraser') => void;
    onUndoMask: () => void;
    canUndoMask: boolean;
    onMagicErase: () => void;
    isMagicEraseDisabled: boolean;
    currentImage: string | null;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onAutoDetect: () => void;
    isDetecting: boolean;
}

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute left-full ml-4 w-auto min-w-max hidden group-hover:block bg-gray-900 text-white text-xs font-bold rounded-md px-2 py-1 shadow-lg border border-gray-700 z-50">
            {text}
        </div>
    </div>
);

export const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
    return (
        <aside className="w-20 bg-gray-900/50 border-r border-gray-800 flex flex-col items-center justify-between p-4">
            <div className="flex flex-col items-center space-y-4">
                <AppIcon className="w-8 h-8 text-blue-500 mb-4" />
                
                <Tooltip text="Start Over">
                    <button onClick={props.onReset} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                        <ResetIcon className="w-6 h-6" />
                    </button>
                </Tooltip>

                <div className="w-full h-px bg-gray-800 my-2"></div>
                
                <Tooltip text="Undo Edit (Ctrl+Z)">
                    <button onClick={props.onUndo} disabled={!props.canUndo} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                        <UndoIcon className="w-6 h-6" />
                    </button>
                </Tooltip>
                 <Tooltip text="Redo Edit (Ctrl+Shift+Z)">
                    <button onClick={props.onRedo} disabled={!props.canRedo} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                        <RedoIcon className="w-6 h-6 -scale-x-100" />
                    </button>
                </Tooltip>
                
                <div className="w-full h-px bg-gray-800 my-2"></div>

                 <Tooltip text="Auto-detect Features">
                    <button onClick={props.onAutoDetect} disabled={props.isDetecting} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors">
                        {props.isDetecting ? <SpinnerIcon className="w-6 h-6" /> : <AutoDetectIcon className="w-6 h-6" />}
                    </button>
                </Tooltip>

                <Tooltip text="Masking Mode (M)">
                    <button onClick={props.onToggleMasking} className={`p-3 rounded-lg transition-colors ${props.isMasking ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <BrushIcon className="w-6 h-6" />
                    </button>
                </Tooltip>

                {props.isMasking && (
                    <div className="flex flex-col items-center space-y-4 pt-2 fade-in">
                        <Tooltip text="Brush (B)">
                             <button onClick={() => props.onSetMaskBrushMode('brush')} className={`p-3 rounded-lg transition-colors ${props.maskBrushMode === 'brush' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                <BrushIcon className="w-5 h-5" />
                            </button>
                        </Tooltip>
                         <Tooltip text="Eraser (E)">
                            <button onClick={() => props.onSetMaskBrushMode('eraser')} className={`p-3 rounded-lg transition-colors ${props.maskBrushMode === 'eraser' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                <EraserIcon className="w-5 h-5" />
                            </button>
                        </Tooltip>
                         <Tooltip text="Undo Stroke">
                            <button onClick={props.onUndoMask} disabled={!props.canUndoMask} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                <UndoIcon className="w-5 h-5" />
                            </button>
                        </Tooltip>
                        <div className="w-full text-center">
                            <label htmlFor="brush-size" className="text-xs text-gray-500 mb-2 block" title="Size ([ or ])">Size</label>
                            <input
                                id="brush-size"
                                type="range"
                                min="5"
                                max="100"
                                value={props.brushSize}
                                onChange={(e) => props.onBrushSizeChange(parseInt(e.target.value, 10))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm accent-blue-500"
                            />
                        </div>

                        <div className="w-full h-px bg-gray-800 my-2"></div>
                         <Tooltip text="Magic Erase">
                            <button onClick={props.onMagicErase} disabled={props.isMagicEraseDisabled} className="p-3 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors">
                                <MagicWandIcon className="w-6 h-6" />
                            </button>
                        </Tooltip>

                    </div>
                )}
            </div>

            <div className="flex flex-col items-center space-y-4">
                 {props.currentImage && (
                    <Tooltip text="Download Image">
                        <a href={props.currentImage} download={`edited-image-${Date.now()}.png`} className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                            <DownloadIcon className="w-6 h-6" />
                        </a>
                    </Tooltip>
                 )}
            </div>
        </aside>
    );
};
