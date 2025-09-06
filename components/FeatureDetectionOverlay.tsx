import React from 'react';
import type { Feature } from '../services/geminiService';
import { DeleteIcon } from './icons/DeleteIcon';

interface FeatureDetectionOverlayProps {
    features: Feature[];
    onFeatureSelect: (feature: Feature) => void;
    onClear: () => void;
}

export const FeatureDetectionOverlay: React.FC<FeatureDetectionOverlayProps> = ({ features, onFeatureSelect, onClear }) => {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none fade-in">
            {/* Overlay for individual features */}
            {features.map((feature, index) => {
                const { x, y, width, height } = feature.boundingBox;
                return (
                    <button
                        key={index}
                        className="absolute flex items-center justify-center p-2 bg-blue-500/20 border-2 border-blue-400 rounded-lg shadow-lg hover:bg-blue-500/40 transition-all duration-200 pointer-events-auto group focus:outline-none focus:ring-4 focus:ring-blue-400/60"
                        style={{
                            left: `${x * 100}%`,
                            top: `${y * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                        }}
                        onClick={() => onFeatureSelect(feature)}
                        title={`Select ${feature.name}`}
                        aria-label={`Select ${feature.name}`}
                    >
                        <span className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {feature.name}
                        </span>
                    </button>
                );
            })}
             {/* Info and Clear button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-2 flex items-center gap-2 pointer-events-auto shadow-xl">
                 <p className="text-sm text-gray-300">
                    Detected {features.length} {features.length === 1 ? 'feature' : 'features'}. Click one to mask.
                </p>
                <button 
                    onClick={onClear} 
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                    title="Dismiss (Esc)"
                    aria-label="Dismiss detected features"
                >
                    <DeleteIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
