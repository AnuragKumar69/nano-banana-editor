import React from 'react';

interface PromptSuggestionsProps {
    onSelectPrompt: (prompt: string) => void;
}

const suggestions = [
    'Add a pirate hat and an eyepatch',
    'Turn it into a watercolor painting',
    'Change background to a futuristic city',
    'Make it black and white, except for one color',
    'Add a friendly alien waving',
    'Give it a cyberpunk aesthetic'
];

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
    return (
        <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((prompt, index) => (
                <button
                    key={index}
                    onClick={() => onSelectPrompt(prompt)}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                >
                    {prompt}
                </button>
            ))}
        </div>
    );
};
