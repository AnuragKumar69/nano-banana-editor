import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { AppIcon } from './icons/AppIcon';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
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
        </div>
    );
};