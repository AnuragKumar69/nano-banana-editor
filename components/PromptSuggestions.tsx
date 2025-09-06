import React from 'react';

interface PromptSuggestionsProps {
    onSelectPrompt: (prompt: string) => void;
}

const suggestions = [
    'Add a pirate hat',
    'Make it a watercolor painting',
    'Add a futuristic city background',
    'Change style to cyberpunk',
    'Add a friendly alien',
];

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
    return (
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
            <span className="text-sm font-medium text-gray-500">Try:</span>
            {suggestions.map((prompt, index) => (
                <button
                    key={index}
                    onClick={() => onSelectPrompt(prompt)}
                    className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors"
                >
                    {prompt}
                </button>
            ))}
        </div>
    );
};