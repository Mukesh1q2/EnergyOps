/**
 * File Upload Component
 * Phase 3: Enhanced Dashboard & Enterprise Features
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Spreadsheet, 
  Database,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';

import { useFileUpload } from '../../hooks/useFileUpload';
import { useFileProcessing } from '../../hooks/useFileProcessing';
import { 
  FileUpload as FileUploadType,
  ProcessingJob,
  SchemaMapping,
  DataValidation
} from '../../types/file-processing';

interface FileUploadProps {
  onFileUploaded?: (file: FileUploadType) => void;
  onFileProcessed?: (file: FileUploadType) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  autoProcess?: boolean;
  organizationId?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileProcessed,
  maxFileSize = 500,
  acceptedFormats = ['csv', 'xlsx', 'xls', 'json', 'pdf', 'txt'],
  autoProcess = true,
  organizationId
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const {
    uploadFile,
    uploadProgress: globalUploadProgress,
    isUploading: globalIsUploading,
    error: uploadError
  } = useFileUpload();

  const {
    processFile,
    getProcessingStatus,
    getSchemaSuggestions,
    validateData,
    getFilePreview,
    processingJobs
  } = useFileProcessing();

  // File type icons
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return <Spreadsheet className="h-6 w-6 text-green-600" />;
      case 'xlsx':
      case 'xls':
        return <Database className="h-6 w-6 text-green-600" />;
      case 'json':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-6 w-6 text-purple-600" />;
      default:
        return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file: File): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`File size exceeds ${maxFileSize}MB limit`);
    }

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(extension || '')) {
      errors.push(`File format ${extension} is not supported`);
    }

    // Check for valid file name
    if (!file.name.trim()) {
      errors.push('File must have a valid name');
    }

    // Additional validations for specific formats
    if (extension === 'csv') {
      if (file.size < 10) {
        warnings.push('CSV file seems too small');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Handle file input change
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Process files
  const handleFiles = useCallback(async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      validation: validateFile(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Auto-upload valid files
    const validFiles = newFiles.filter(f => f.validation?.isValid);
    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  }, []);

  // Upload files
  const uploadFiles = useCallback(async (files: UploadedFile[]) => {
    setIsUploading(true);

    for (const { file } of files) {
      try {
        const uploadedFile = await uploadFile(file, {
          auto_process: autoProcess,
          detect_schema: true,
          validate_data: true,
          create_visualizations: true,
          organization_id: organizationId
        });

        onFileUploaded?.(uploadedFile);

        // Auto-process if requested
        if (autoProcess) {
          await processFile(uploadedFile.id, [
            'schema_detection',
            'data_validation',
            'visualization_generation'
          ]);
        }

      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }

    setIsUploading(false);
  }, [uploadFile, autoProcess, processFile, organizationId, onFileUploaded]);

  // Remove file
  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Retry upload
  const retryUpload = useCallback((index: number) => {
    const file = uploadedFiles[index];
    if (file && file.validation?.isValid) {
      uploadFiles([file]);
    }
  }, [uploadedFiles, uploadFiles]);

  // Get processing status for file
  const getFileProcessingStatus = useCallback((fileName: string) => {
    const matchingJobs = processingJobs.filter(job => 
      job.file_upload?.original_filename === fileName
    );
    return matchingJobs[0];
  }, [processingJobs]);

  return (
    <div className="file-upload-container w-full">
      {/* Upload Area */}
      <motion.div
        className={`upload-area relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : uploadedFiles.length === 0 
              ? 'border-gray-300 hover:border-gray-400 bg-gray-50'
              : 'border-gray-200 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="upload-content">
          <motion.div
            animate={{ 
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              isDragOver ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </motion.div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragOver ? 'Drop files here' : 'Upload your data files'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            Drag and drop files or click to browse
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {acceptedFormats.map(format => (
              <span 
                key={format}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded uppercase"
              >
                {format}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Maximum file size: {maxFileSize}MB
          </p>
        </div>

        {/* Upload overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg"
            >
              <div className="text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Uploading files...</p>
                <p className="text-xs text-gray-500">Please wait while we process your files</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>

          <div className="space-y-4">
            {uploadedFiles.map((uploadedFile, index) => {
              const { file, validation, preview } = uploadedFile;
              const processingStatus = getFileProcessingStatus(file.name);
              const progress = globalUploadProgress[file.name] || 0;

              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="file-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    {/* File Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {preview ? (
                          <img 
                            src={preview} 
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          getFileIcon(file.name)
                        )}
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </h4>
                          
                          {/* Validation Status */}
                          {validation && (
                            <div className="flex items-center space-x-1">
                              {validation.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          
                          {/* Processing Status */}
                          {processingStatus && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                processingStatus.status === 'completed' ? 'bg-green-500' :
                                processingStatus.status === 'failed' ? 'bg-red-500' :
                                processingStatus.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-400'
                              }`} />
                              <span className="text-xs text-gray-500 capitalize">
                                {processingStatus.status}
                              </span>
                              {processingStatus.status === 'processing' && (
                                <span className="text-xs text-gray-400">
                                  {Math.round(processingStatus.progress * 100)}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Upload Progress */}
                        {progress > 0 && progress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* ML Features Button */}
                      {validation?.isValid && (
                        <button
                          onClick={async () => {
                            try {
                              const suggestions = await getSchemaSuggestions(file.name);
                              // Show ML suggestions modal
                            } catch (error) {
                              console.error('Failed to get ML suggestions:', error);
                            }
                          }}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                          title="Get ML-powered suggestions"
                        >
                          <Brain className="h-4 w-4" />
                        </button>
                      )}

                      {/* Preview Button */}
                      <button
                        onClick={async () => {
                          try {
                            const previewData = await getFilePreview(file.name);
                            // Show preview modal
                          } catch (error) {
                            console.error('Failed to get file preview:', error);
                          }
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Preview file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Retry Button */}
                      {validation && !validation.isValid && (
                        <button
                          onClick={() => retryUpload(index)}
                          className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded"
                          title="Retry upload"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Validation Results */}
                  {validation && (
                    <div className="mt-3 space-y-2">
                      {validation.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs font-medium text-red-700">
                              Validation Errors:
                            </span>
                          </div>
                          <ul className="mt-1 text-xs text-red-600 space-y-1">
                            {validation.errors.map((error, i) => (
                              <li key={i} className="ml-4">• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-700">
                              Warnings:
                            </span>
                          </div>
                          <ul className="mt-1 text-xs text-yellow-600 space-y-1">
                            {validation.warnings.map((warning, i) => (
                              <li key={i} className="ml-4">• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ML Processing Results */}
                  {processingStatus && processingStatus.status === 'completed' && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">
                          AI Processing Complete
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-purple-600">
                          <BarChart3 className="inline h-3 w-3 mr-1" />
                          Schema detected
                        </div>
                        <div className="text-purple-600">
                          <Brain className="inline h-3 w-3 mr-1" />
                          Quality scored
                        </div>
                        <div className="text-purple-600">
                          <CheckCircle className="inline h-3 w-3 mr-1" />
                          Ready to use
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Error */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-50 border border-red-200 rounded p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              Upload Error
            </span>
          </div>
          <p className="mt-1 text-sm text-red-600">
            {uploadError}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;