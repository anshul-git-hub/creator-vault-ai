'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ErrorBoundary from '@/components/ui/error-boundary';
import { 
  Search as SearchIcon, 
  FileText, 
  Trash2, 
  Download, 
  ExternalLink,
  SlidersHorizontal,
  FolderOpen,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Database,
  Brain,
  Video,
  FileCheck,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/empty-state';
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

interface SearchContentProps {
  initialFiles: FileRow[];
  userId: string;
}

const CATEGORIES = [
  'All Categories',
  'Content Ideas',
  'Scripts',
  'Thumbnail References',
  'Brand Assets',
  'Research',
  'Inspiration',
];

const FILE_TYPES = [
  { name: 'All Types', value: 'all' },
  { name: 'Images', value: 'image/' },
  { name: 'PDFs & Docs', value: 'application/pdf' },
  { name: 'Text / Scripts', value: 'text/' },
  { name: 'Videos', value: 'video/' },
  { name: 'Audios', value: 'audio/' },
];

const DATE_FILTERS = [
  { name: 'All Time', value: 'all' },
  { name: 'Last 7 Days', value: '7' },
  { name: 'Last 30 Days', value: '30' },
];

export default function SearchContent({ initialFiles, userId }: SearchContentProps) {
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [now] = useState(() => Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedType('all');
    setSelectedDate('all');
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Content Ideas': Sparkles,
    'Scripts': FileText,
    'Thumbnail References': ImageIcon,
    'Brand Assets': Database,
    'Research': Brain,
    'Inspiration': Video,
  };

  // Advanced Filtering including Date Range
  const filteredFiles = files.filter((f) => {
    const matchesQuery = 
      f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All Categories' || 
      f.category === selectedCategory;
      
    const matchesType = 
      selectedType === 'all' || 
      f.file_type.toLowerCase().includes(selectedType.toLowerCase());

    let matchesDate = true;
    if (selectedDate !== 'all') {
      const limitDays = parseInt(selectedDate, 10);
      const timeDiff = now - new Date(f.uploaded_at).getTime();
      const diffDays = timeDiff / (1000 * 60 * 60 * 24);
      matchesDate = diffDays <= limitDays;
    }

    return matchesQuery && matchesCategory && matchesType && matchesDate;
  });

  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Vault Search</h1>
        <p className="text-zinc-400 text-sm">Query your second brain using keywords and structured filters.</p>
      </div>

      {/* Control bar */}
      <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
        {/* Text Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by file name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Filter Settings
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Selector */}
            <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* File Type Selector */}
            <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                File Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                {FILE_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-zinc-900 text-white">
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Date Range Selector */}
            <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Date Added
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                {DATE_FILTERS.map((df) => (
                  <option key={df.value} value={df.value} className="bg-zinc-900 text-white">
                    {df.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Results ({filteredFiles.length})
        </span>
        {(searchQuery || selectedCategory !== 'All Categories' || selectedType !== 'all' || selectedDate !== 'all') && (
          <button 
            onClick={handleResetFilters}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Section */}
      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-6 h-6" />}
          title="No assets found"
          description="Try relaxing your search terms or filters."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const CatIcon = categoryIcons[file.category] || FileCheck;
            return (
              <div 
                key={file.id} 
                className="p-5 rounded-2xl bg-[#131316]/50 border border-white/5 flex flex-col justify-between hover:border-purple-500/20 transition-all hover:scale-[1.01] relative overflow-hidden group shadow-lg"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full blur-xl pointer-events-none" />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-900/40 uppercase tracking-wider">
                      <CatIcon className="w-3 h-3 text-purple-400" />
                      {file.category}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[120px]">
                      {file.file_type}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handlePreview(file)}
                    className="block font-bold text-white hover:text-purple-400 transition-colors text-base truncate pr-5 text-left cursor-pointer"
                  >
                    {file.file_name}
                  </button>

                  <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-zinc-600" />
                      {formatSize(file.file_size)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 relative z-10">
                  <Link 
                    href={`/files/${file.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    View Details
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      disabled={deletingId === file.id}
                      className="p-1.5 rounded-lg border border-red-500/10 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:border-red-500/25 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete File"
                    >
                      {deletingId === file.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </motion.div>
      <FilePreviewModal 
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={(f) => {
          window.open(f.url, '_blank');
        }}
      />
    </ErrorBoundary>
  );
}
