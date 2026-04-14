import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('invoices', file);
    });

    try {
      await axios.post(`${API_BASE_URL}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFiles([]);
      onUploadComplete();
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Upload Invoices</h2>
        <p className="text-muted-foreground">Select or drag & drop invoice PDF files for AI processing</p>
      </div>

      <div 
        className={`relative h-64 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-muted/20 ${
          dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:bg-muted/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Upload size={32} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">Click or drag files here</p>
          <p className="text-sm text-muted-foreground mt-1">Accepts multiple PDF files up to 10MB each</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-card rounded-3xl border border-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{files.length} Files Selected</h3>
            <button 
              onClick={() => setFiles([])}
              className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 group">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                Start AI Analysis
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
