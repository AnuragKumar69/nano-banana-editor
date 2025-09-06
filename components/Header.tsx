
import React from 'react';
import { BananaIcon } from './icons/BananaIcon';
import { ResetIcon } from './icons/ResetIcon';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}


export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700/50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <BananaIcon className="w-8 h-8 text-yellow-400" />
                    <h1 className="text-2xl font-bold text-white tracking-tight" style={{fontFamily: "'Poppins', sans-serif"}}>
                        Nano Banana Editor
                    </h1>
                </div>
                 {showReset && (
                    <button 
                        onClick={onReset}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
                        title="Start Over"
                    >
                        <ResetIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Start Over</span>
                    </button>
                )}
            </div>
        </header>
    );
};
