import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Calendar, HardDrive, Tag } from 'lucide-react';
import { useEffect } from 'react';

export interface PreviewFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number | null;
  uploadedAt: string;
  category: string;
}

interface FilePreviewModalProps {
  file: PreviewFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: PreviewFile) => void;
}

export default function FilePreviewModal({ file, isOpen, onClose, onDownload }: FilePreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!file) return null;

  const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|gif)$/i);
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const canPreview = isImage || isPdf;

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0, damping: 25 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#131316]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{file.name}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatSize(file.size)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(file.uploadedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {file.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDownload(file)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-black/40 overflow-hidden relative min-h-[300px] flex items-center justify-center p-4">
              {canPreview ? (
                isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <iframe 
                    src={file.url} 
                    title={file.name}
                    className="w-full h-full border-0 rounded-lg bg-white"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-zinc-500" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">Preview not available for this file type.</p>
                  <p className="text-xs text-zinc-500 mt-1">Please download the file to view its contents.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
