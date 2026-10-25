import React, { useState, useRef } from 'react';

export default function ImageUploader({
  selectedFile,
  onFileSelect,
  label = 'Upload Site Image',
  description = 'Drag & drop image here or click to browse (JPG, PNG, WEBP up to 25MB)',
  accept = 'image/*',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Sync preview with selectedFile
  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please drop a valid image file (JPG, PNG, WEBP).');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        {label}
      </label>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        /* Empty Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-amber-500 bg-amber-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/20 shadow-xs'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-amber-200 transition-all duration-200 shadow-xs">
              📸
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {description}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
              <span>Choose Image</span>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div className="relative border border-slate-200 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white backdrop-blur-xs">
                Preview
              </span>
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                  Ready for AI Analysis
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedFile.type || 'image/jpeg'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1 truncate">
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Size: {formatFileSize(selectedFile.size)}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
