'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  File,
  ArrowRight,
  Sparkles,
  Link2,
  ArrowLeft
} from 'lucide-react';
import { getCreatorCategories } from '@/lib/categories';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useActivity } from '@/lib/activity';
import PageHeader from '@/components/ui/page-header';

interface UploadFormProps {
  userId: string;
  creatorType?: string | null;
}

interface SessionUpload {
  id: string;
  name: string;
  size: number;
  category: string;
  uploadedAt: Date;
}

export default function UploadForm({ userId, creatorType }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const dynamicCategories = getCreatorCategories(creatorType);

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(dynamicCategories[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sessionUploads, setSessionUploads] = useState<SessionUpload[]>([]);
  const { logActivity } = useActivity();

  // Cleanup progress on unmount
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

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
      setFile(e.dataTransfer.files[0]);
      setSuccess(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select or drop a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      // Start a smooth simulated progress update
      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 88) {
            if (progressInterval.current) clearInterval(progressInterval.current);
            return 88;
          }
          const increment = Math.floor(Math.random() * 10) + 3;
          return prev + increment;
        });
      }, 150);

      // Create a unique file identifier
      const fileId = crypto.randomUUID();
      
      // Sanitizing filename: replace spaces with underscores, strip non-ascii, and remove special characters
      let cleanFileName = file.name.replace(/[^\x00-\x7F]/g, ''); // strip non-ascii
      cleanFileName = cleanFileName.replace(/\s+/g, '_'); // replace spaces with underscores
      cleanFileName = cleanFileName.replace(/[^a-zA-Z0-9_\-\.]/g, ''); // strip other special chars
      // Safe fallback in case the name is empty after cleanup
      if (!cleanFileName || cleanFileName === '.' || cleanFileName === '..') {
        const ext = file.name.split('.').pop() || '';
        cleanFileName = `asset_${Date.now()}${ext ? `.${ext}` : ''}`;
      }
      
      const storagePath = `${userId}/${cleanFileName}`;

      // 1. Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('creator-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // Construct storage url (internal identifier) securely
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
      const storageUrl = `${baseUrl}/storage/v1/object/private/creator-files/${storagePath}`;

      // 2. Insert record into files table (saving file_size)
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          id: fileId,
          user_id: userId,
          file_name: file.name,
          file_type: file.type || 'application/octet-stream',
          storage_url: storageUrl,
          category: category,
          ai_summary: null,
          file_size: file.size // Phase 2: Save the actual file size
        });

      if (dbError) {
        // Cleanup storage on database error
        await supabase.storage.from('creator-files').remove([storagePath]);
        throw new Error(`Database entry failed: ${dbError.message}`);
      }

      // Finish progress bar on successful completion
      if (progressInterval.current) clearInterval(progressInterval.current);
      setUploadProgress(100);

      const newUploadedAsset: SessionUpload = {
        id: fileId,
        name: file.name,
        size: file.size,
        category: category,
        uploadedAt: new Date()
      };

      setSessionUploads((prev) => [newUploadedAsset, ...prev]);
      setSuccess(true);
      setFile(null);
      logActivity('Uploaded', file.name, category);
      toast.success('Asset uploaded successfully!');
      
      // Reset input ref
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      router.refresh();
    } catch (err: unknown) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setUploadProgress(0);
      const errMsg = err instanceof Error ? err.message : 'An error occurred during upload.';
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="max-w-2xl mx-auto space-y-6">
      <PageHeader 
        title="Upload Asset"
        description="Add a new reference, script, or asset to your secure vault."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Upload' }]}
        backLink="/dashboard"
        backLabel="Back to Dashboard"
      />

      {success && (
        <div className="p-4.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload Successful!</p>
            <p className="opacity-90 mt-0.5">Your asset has been cataloged and added to the vault.</p>
            <div className="flex gap-4 mt-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6 shadow-xl relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Category selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Select Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-3 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-purple-600/15 border-purple-500/50 text-purple-300 shadow-inner'
                    : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            File Upload
          </label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                : 'border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02] bg-white/[0.01]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <File className="w-6 h-6 text-purple-400" />
                </div>
                <div className="max-w-xs truncate font-semibold text-sm text-white">
                  {file.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Drag & drop your file here</p>
                  <p className="text-xs text-zinc-500 mt-1">or click to browse from your device</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (Visible during uploading or success full render) */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                Encrypting & Uploading asset...
              </span>
              <span className="font-bold text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-purple-950/20"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Securing in Vault ({uploadProgress}%)
            </>
          ) : (
            'Store Securely in Vault'
          )}
        </button>
      </motion.div>

      {/* Session Uploads (Active Upload Session Panel) */}
      {sessionUploads.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#131316]/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Uploaded in this session</h3>
            <span className="text-xs font-semibold text-purple-400">{sessionUploads.length} total</span>
          </div>

          <div className="divide-y divide-white/5">
            {sessionUploads.map((asset) => (
              <div 
                key={asset.id} 
                className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-white/[0.01] px-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center shrink-0">
                    <File className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-[350px]">
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {(asset.size / 1024 / 1024).toFixed(2)} MB • {asset.category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/files/${asset.id}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-purple-600 px-2.5 py-1 rounded-md transition-all shrink-0 cursor-pointer"
                >
                  View <Link2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
