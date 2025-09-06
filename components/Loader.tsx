import React, { useState, useEffect } from 'react';

const messages = [
    'Go Bananas!',
    'Warming up the pixels...',
    'Consulting with art spirits...',
    'Reticulating splines...',
    'Unleashing creative AI...',
    'Painting with algorithms...',
    'Polishing the pixels...',
];

export const Loader: React.FC = () => {
    const [message, setMessage] = useState(messages[0]);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentIndex = messages.indexOf(message);
            const nextIndex = (currentIndex + 1) % messages.length;
            setMessage(messages[nextIndex]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [message]);

    return (
       <div className="flex flex-col items-center justify-center space-y-3">
            <svg
                className="animate-spin h-8 w-8 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <p className="text-yellow-400 font-medium text-lg loader-text-animate">{message}</p>
        </div>
    );
};