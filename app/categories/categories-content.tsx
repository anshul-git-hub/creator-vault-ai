'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Database, 
  Brain, 
  Video,
  FileCheck,
  FolderOpen,
  PieChart,
  HardDrive,
  Download,
  Trash2,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getCreatorCategories, getCategoryIcon } from '@/lib/categories';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/empty-state';
import PageHeader from '@/components/ui/page-header';
import FilePreviewModal, { PreviewFile } from '@/components/ui/file-preview-modal';

interface FileRow {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_url: string;
  category: string;
  ai_summary: string | null;
  file_size?: number | null;
  uploaded_at: string;
}

interface CategoriesContentProps {
  initialFiles: FileRow[];
  userId: string;
  creatorType?: string | null;
}

export default function CategoriesContent({ initialFiles, userId, creatorType }: CategoriesContentProps) {
  const dynamicCategories = getCreatorCategories(creatorType);
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(dynamicCategories[0]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = async (file: FileRow) => {
    try {
      const pathParts = file.storage_url.split('/creator-files/');
      const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

      const { data, error } = await supabase.storage
        .from('creator-files')
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        setPreviewFile({
          id: file.id,
          name: file.file_name,
          url: data.signedUrl,
          type: file.file_type,
          size: file.file_size,
          uploadedAt: file.uploaded_at,
          category: file.category
        });
        setIsPreviewOpen(true);
      }
    } catch (err) {
      toast.error('Error loading preview: ' + (err as Error).message);
    }
  };

  const handleDownload = async (file: FileRow) => {
    try {
      const pathParts = file.storage_url.split('/creator-files/');
      const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

      const { data, error } = await supabase.storage
        .from('creator-files')
        .createSignedUrl(storagePath, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      toast.error('Error downloading file: ' + (err as Error).message);
    }
  };

  const handleDelete = async (file: FileRow) => {
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) return;

    try {
      setDeletingId(file.id);

      const pathParts = file.storage_url.split('/creator-files/');
      const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

      await supabase.storage.from('creator-files').remove([storagePath]);

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      setFiles(files.filter((f) => f.id !== file.id));
      toast.success('Asset deleted successfully');
    } catch (err) {
      toast.error('Error deleting file: ' + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  // Group files by category
  const filesByCategory = dynamicCategories.reduce((acc, cat) => {
    acc[cat] = files.filter((f) => f.category === cat);
    return acc;
  }, {} as Record<string, FileRow[]>);

  // Compute storage and counts
  const categorySizes = dynamicCategories.reduce((acc, cat) => {
    acc[cat] = filesByCategory[cat].reduce((sum, f) => sum + (Number(f.file_size) || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const totalSizeAll = Object.values(categorySizes).reduce((a, b) => a + b, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Title */}
      <PageHeader 
        title="Categories Dashboard"
        description="Visualize your creator knowledge asset distribution and storage weight."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Categories' }]}
        backLink="/dashboard"
        backLabel="Back to Dashboard"
      />

      {/* Analytics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Stats & distribution charts */}
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-3xl border border-white/5 bg-[#131316]/50 p-7 space-y-7">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <PieChart className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Asset Distribution</h2>
            </div>

            <div className="space-y-4">
              {dynamicCategories.map((cat) => {
                const count = filesByCategory[cat].length;
                const size = categorySizes[cat];
                const percentageOfCount = (count / (files.length || 1)) * 100;
                const Icon = getCategoryIcon(cat);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-purple-400" />
                        {cat}
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {count} ({formatSize(size)})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                        style={{ width: `${percentageOfCount}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-purple-400" />
                Cumulative size
              </span>
              <span className="font-bold text-white">{formatSize(totalSizeAll)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Folders View */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-white/5 bg-[#131316]/50 p-7 space-y-7">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <FolderOpen className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Explore Vault Folders</h2>
            </div>

            <div className="space-y-3">
              {dynamicCategories.map((cat) => {
                const count = filesByCategory[cat].length;
                const size = categorySizes[cat];
                const isExpanded = expandedCategory === cat;
                const Icon = getCategoryIcon(cat);

                return (
                  <div 
                    key={cat} 
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isExpanded 
                        ? 'bg-[#18181f]/40 border-purple-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isExpanded ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-zinc-800/40 border-white/5 text-zinc-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{cat}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {count} {count === 1 ? 'file' : 'files'} • {formatSize(size)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-400 hover:text-purple-300">
                        {isExpanded ? 'Collapse' : 'Explore'}
                      </span>
                    </button>

                    {/* Files list accordion */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-white/5 space-y-3">
                        {filesByCategory[cat].length === 0 ? (
                          <div className="pt-4 pb-2">
                            <EmptyState 
                              icon={<FolderOpen className="w-5 h-5" />}
                              title="Category is empty"
                              description="This category is waiting for its first asset."
                            />
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {filesByCategory[cat].map((file) => (
                              <div 
                                key={file.id} 
                                className="py-3.5 flex items-center justify-between gap-4 text-xs group hover:bg-white/[0.01] px-2 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                                  <div className="min-w-0">
                                    <button
                                      onClick={() => handlePreview(file)}
                                      className="font-semibold text-white hover:text-purple-400 transition-colors truncate block max-w-[150px] sm:max-w-md text-left cursor-pointer"
                                    >
                                      {file.file_name}
                                    </button>
                                    <span className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                      {formatSize(Number(file.file_size) || 0)}
                                      <span>•</span>
                                      <Calendar className="w-3 h-3 text-zinc-600 inline" />
                                      {new Date(file.uploaded_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleDownload(file)}
                                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                    title="Download Asset"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(file)}
                                    disabled={deletingId === file.id}
                                    className="p-1.5 rounded-lg border border-red-500/10 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:border-red-500/25 transition-colors disabled:opacity-50 cursor-pointer"
                                    title="Delete Asset"
                                  >
                                    {deletingId === file.id ? (
                                      <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <FilePreviewModal 
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={(f) => {
          window.open(f.url, '_blank');
        }}
      />
    </motion.div>
  );
}
