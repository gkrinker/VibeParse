import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props interface for the FileUpload component
 */
interface FileUploadProps {
  onFileUpload: (file: File) => void;  // Callback function when file is uploaded
}

/**
 * FileUpload component
 * Handles file selection, validation, and upload process
 */
const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  // State for tracking selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State for tracking drag and drop status
  const [isDragging, setIsDragging] = useState(false);
  
  // State for tracking error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates the selected file
   * @param file - The file to validate
   * @returns boolean indicating if file is valid
   */
  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    setError(null);
    return true;
  };

  /**
   * Handles file selection from input
   * @param event - Change event from file input
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  /**
   * Handles file drop event
   * @param event - Drag event
   */
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  /**
   * Handles drag over event
   * @param event - Drag event
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  /**
   * Handles drag leave event
   */
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handles file upload
   */
  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  /**
   * Removes the selected file
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* File drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400'
          }
          ${selectedFile ? 'bg-gray-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* File input */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {!selectedFile ? (
          // Upload prompt
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF and Word documents up to 10MB
              </p>
            </div>
          </div>
        ) : (
          // Selected file display
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Upload button */}
      {selectedFile && !error && (
        <Button
          onClick={handleUpload}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          Upload and Process
        </Button>
      )}
    </div>
  );
};

export default FileUpload;
