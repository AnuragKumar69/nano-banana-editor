import React from 'react';
import { PromptSuggestions } from './PromptSuggestions';
import { SparkleIcon } from './icons/SparkleIcon';
import { RedoIcon } from './icons/RedoIcon';

interface BottomPanelProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onEditRequest: (promptOverride?: string, isRegeneration?: boolean) => void;
    onRegenerate: () => void;
    isMasking: boolean;
    isLoading: boolean;
    isRegenerateDisabled: boolean;
    lastSuccessfulPrompt: string;
}

export const BottomPanel: React.FC<BottomPanelProps> = (props) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (props.prompt && !props.isLoading) {
                props.onEditRequest();
            }
        }
    };

    return (
        <footer className="bg-gray-900/50 border-t border-gray-800 p-4">
            <div className="w-full max-w-3xl mx-auto space-y-4">
                <PromptSuggestions onSelectPrompt={(p) => props.onPromptChange(p)} />
                <div className="relative">
                    <textarea 
                        value={props.prompt} 
                        onChange={(e) => props.onPromptChange(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder={props.isMasking ? "Describe what to do in the masked area..." : "e.g., 'add a birthday hat'"} 
                        className="w-full p-4 pl-5 pr-48 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-lg" 
                        rows={2} 
                        disabled={props.isLoading} 
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button 
                            onClick={props.onRegenerate} 
                            disabled={props.isRegenerateDisabled} 
                            className="p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                            title={`Regenerate (Ctrl+G): "${props.lastSuccessfulPrompt}"`}
                        >
                            <RedoIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => props.onEditRequest()} 
                            disabled={props.isLoading || !props.prompt} 
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40" 
                            title="Generate (Ctrl+Enter)"
                        >
                            <SparkleIcon className="w-5 h-5" />
                            <span>Generate</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};