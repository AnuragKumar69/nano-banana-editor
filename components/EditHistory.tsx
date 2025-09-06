import React from 'react';

interface EditHistoryProps {
    history: string[];
    activeIndex: number;
    onSelect: (index: number) => void;
}

export const EditHistory: React.FC<EditHistoryProps> = ({ history, activeIndex, onSelect }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">Edit History</h3>
            <div className="flex items-center justify-center space-x-3 overflow-x-auto pb-2">
                {history.map((imageSrc, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-500 ${
                            index === activeIndex ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : 'ring-1 ring-gray-600 hover:ring-yellow-500'
                        }`}
                        title={index === 0 ? 'Original Image' : `Edit #${index}`}
                    >
                        <img
                            src={imageSrc}
                            alt={index === 0 ? 'Original' : `Edit ${index}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};
