import React from 'react';
import { EditHistory } from './EditHistory';
import { ErrorIcon } from './icons/ErrorIcon';
import { InfoIcon } from './icons/InfoIcon';

interface RightSidebarProps {
    history: string[];
    activeIndex: number;
    onSelectHistory: (index: number) => void;
    onDeleteHistory: (index: number) => void;
    error: string | null;
    modelResponseText: string | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = (props) => {
    return (
        <aside className="w-64 bg-gray-900/50 border-l border-gray-800 flex flex-col p-4 space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1">History</h3>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                    {props.history.length > 1 ? (
                        <EditHistory 
                            history={props.history} 
                            activeIndex={props.activeIndex} 
                            onSelect={props.onSelectHistory}
                            onDelete={props.onDeleteHistory}
                        />
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-500">No edits yet.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-grow flex flex-col justify-end space-y-3">
                 {props.error && (
                    <div className="flex items-start gap-3 bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm fade-in">
                        <ErrorIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{props.error}</span>
                    </div>
                )}
                {props.modelResponseText && (
                    <div className="flex items-start gap-3 bg-blue-900/50 border border-blue-500/50 text-blue-200 p-3 rounded-xl text-sm fade-in">
                        <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                         <span className="break-words">{props.modelResponseText}</span>
                    </div>
                )}
            </div>
        </aside>
    );
};