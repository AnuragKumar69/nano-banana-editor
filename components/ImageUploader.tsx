import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { AppIcon } from './icons/AppIcon';

interface ImageUploaderProps {
    onImageUpload: (imageData: File | string) => void;
}

const getRecentImages = (): string[] => {
    try {
        const storedImages = localStorage.getItem('recentImages');
        return storedImages ? JSON.parse(storedImages) : [];
    } catch (error) {
        console.error("Failed to parse recent images from localStorage", error);
        return [];
    }
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [recentImages, setRecentImages] = useState<string[]>([]);

    useEffect(() => {
        setRecentImages(getRecentImages());
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleRecentImageClick = (dataUrl: string) => {
        onImageUpload(dataUrl);
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#05070D] p-4 text-center fade-in">
            <div className="flex flex-col items-center justify-center">
                 <AppIcon className="w-16 h-16 mb-4 text-blue-500" />
                 <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{fontFamily: "'Poppins', sans-serif"}}>
                     Nano Banana Studio
                 </h1>
                 <p className="text-lg text-gray-400 mb-10 max-w-xl">
                     A professional image editor powered by Gemini. Upload an image to begin your creative journey.
                 </p>
                <label
                    htmlFor="image-upload"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-500/10 ring-4 ring-blue-500/20' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-900'}`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-10 h-10 mb-4 text-gray-500" />
                        <p className="mb-2 text-base text-gray-400">
                            <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP, or GIF</p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>

            {recentImages.length > 0 && (
                <div className="mt-12 w-full max-w-2xl">
                    <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Recent Images</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                        {recentImages.map((src, index) => (
                            <button
                                key={index}
                                onClick={() => handleRecentImageClick(src)}
                                className="aspect-square bg-gray-900 rounded-lg overflow-hidden group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070D] transition-transform duration-200 hover:scale-105"
                                title="Load this image"
                            >
                                <img src={src} alt={`Recent image ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">Load</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};