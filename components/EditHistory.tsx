import React from 'react';
import { DeleteIcon } from './icons/DeleteIcon';

interface EditHistoryProps {
    history: string[];
    activeIndex: number;
    onSelect: (index: number) => void;
    onDelete: (index: number) => void;
}

export const EditHistory: React.FC<EditHistoryProps> = ({ history, activeIndex, onSelect, onDelete }) => {
    return (
        <div className="flex flex-col space-y-3">
            {history.map((imageSrc, index) => (
                <div key={index} className="flex-shrink-0 text-center relative group">
                     <button
                        onClick={() => onSelect(index)}
                        className={`relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/70 border-2 shadow-lg ${
                            index === activeIndex ? 'border-blue-500' : 'border-gray-700 hover:border-blue-600'
                        }`}
                        title={index === 0 ? 'Original Image' : `Edit #${index}`}
                    >
                        <img
                            src={imageSrc}
                            alt={index === 0 ? 'Original' : `Edit ${index}`}
                            className="w-full h-full object-cover"
                        />
                         <div className="absolute bottom-0 left-0 bg-black/50 px-2 py-0.5 rounded-tr-md">
                            <span className={`text-xs font-semibold transition-colors ${index === activeIndex ? 'text-blue-400' : 'text-gray-400'}`}>
                               {index === 0 ? 'Original' : `V${index}`}
                            </span>
                         </div>
                    </button>
                    {index > 0 && (
                        <button
                            onClick={() => onDelete(index)}
                            className="absolute top-1 right-1 z-10 p-1 bg-gray-900/50 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title={`Delete V${index}`}
                            aria-label={`Delete version ${index}`}
                        >
                            <DeleteIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};