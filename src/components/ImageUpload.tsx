'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUpload({ label, currentImageUrl, onImageUpload, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onImageUpload(data.imageUrl);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload('');
    setShowUrlInput(false);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageUpload(urlInput.trim());
      setPreviewUrl(urlInput.trim());
      setShowUrlInput(false);
      setError(null);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="space-y-3">
        {/* File Input */}
        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>

        {/* Manual URL Input Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showUrlInput ? 'Cancel URL Input' : 'Use Image URL Instead'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {/* URL Input Fallback */}
        {showUrlInput && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Enter the URL of your image:
            </p>
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Use URL
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-3">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Image Display */}
        {currentImageUrl && !previewUrl && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Current image:</p>
            <img
              src={currentImageUrl}
              alt="Current"
              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );
} 