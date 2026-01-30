'use client';

import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

interface Props {
    onUpload: (file: File, language: 'en' | 'hi') => void;
}

export default function ContractUploader({ onUpload }: Props) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onUpload(selectedFile, language);
        }
    };

    return (
        <div className="space-y-4">
            {/* Language Toggle */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-lg ${language === 'en'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    English
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    className={`px-4 py-2 rounded-lg ${language === 'hi'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    हिन्दी (Hindi)
                </button>
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 bg-gray-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="space-y-4">
                        <FileText className="h-16 w-16 text-indigo-600 mx-auto" />
                        <p className="text-lg font-medium text-gray-900">
                            {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Remove
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                Analyze Contract
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                Drop your contract here
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                or click to browse
                            </p>
                        </div>
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Select File
                        </button>
                        <p className="text-xs text-gray-400">
                            Supports PDF, DOCX, TXT, PNG, JPG (max 10MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
