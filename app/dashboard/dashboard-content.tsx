'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ErrorBoundary from '@/components/ui/error-boundary';
import { getCreatorCategories, getCategoryIcon } from '@/lib/categories';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useActivity } from '@/lib/activity';
import EmptyState from '@/components/ui/empty-state';
import FilePreviewModal, { PreviewFile } from '@/components/ui/file-preview-modal';
import { 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  Upload, 
  Plus, 
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Database,
  Brain,
  Video,
  FileCheck,
  HardDrive,
  Clock,
  Settings,
  FolderHeart,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

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

interface DashboardContentProps {
  initialFiles: FileRow[];
  userId: string;
  profile?: any;
  userEmail?: string;
  userFullName?: string;
}

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export default function DashboardContent({ initialFiles, userId, profile, userEmail, userFullName }: DashboardContentProps) {
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [now] = useState(() => Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const { activities, logActivity } = useActivity();
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
      toast.error('Error fetching file download link: ' + (err as Error).message);
    }
  };

  const handleDelete = async (file: FileRow) => {
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) return;

    try {
      setDeletingId(file.id);

      const pathParts = file.storage_url.split('/creator-files/');
      const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('creator-files')
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage deletion warning/error:', storageError);
      }

      // Delete from Database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Update state
      setFiles(files.filter((f) => f.id !== file.id));
      logActivity('Deleted', file.file_name, file.category);
      toast.success('Asset deleted successfully');
    } catch (err) {
      toast.error('Error deleting file: ' + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  // Compute category statistics dynamically
  const dynamicCategories = getCreatorCategories(profile?.creator_type);
  const categoryStats: Record<string, number> = {};
  
  dynamicCategories.forEach(cat => {
    categoryStats[cat] = 0;
  });

  files.forEach((f) => {
    if (f.category in categoryStats) {
      categoryStats[f.category] += 1;
    }
  });

  // Compute total storage size
  const totalSizeBytes = files.reduce((acc, f) => acc + (Number(f.file_size) || 0), 0);
  const storagePercentage = Math.min((totalSizeBytes / STORAGE_LIMIT_BYTES) * 100, 100);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const aiSummarizedCount = files.filter(f => f.ai_summary !== null).length;

  // Filter logic
  const filteredFiles = files.filter((f) => {
    const matchesQuery = 
      f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.file_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategoryFilter || f.category === selectedCategoryFilter;

    return matchesQuery && matchesCategory;
  });

  const getTimeLabel = (timestamp: string) => {
    const timeDiff = now - new Date(timestamp).getTime();
    const min = Math.floor(timeDiff / 60000);
    const hrs = Math.floor(min / 60);
    const days = Math.floor(hrs / 24);
    if (min < 60) return min <= 0 ? 'just now' : `${min}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <ErrorBoundary>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/20 to-black border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {userFullName || userEmail?.split('@')[0] || 'Creator'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
              {profile?.creator_type || 'Creator'}
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
              {profile?.working_style || 'Organized'}
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-zinc-300">
              Goal: {profile?.goals || 'Create Content'}
            </span>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Your Second Brain</h1>
          <p className="text-zinc-400 text-sm">Manage and retrieve all your creator references and assets.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-zinc-300 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition-colors shadow-lg shadow-purple-950/20"
          >
            <Plus className="w-4 h-4" />
            Upload File
          </Link>
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Card */}
        <div className="p-6 rounded-2xl bg-[#131316]/60 border border-white/5 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              Vault Storage
            </span>
            <span className="text-xs font-bold text-white">
              {storagePercentage.toFixed(1)}% Used
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {formatSize(totalSizeBytes)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">of 10 GB limit allocated</p>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${storagePercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
            />
          </div>
        </div>

        {/* Total Assets Card */}
        <div className="p-6 rounded-2xl bg-[#131316]/60 border border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-purple-400" />
              Total Assets
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <div>
            <div className="text-4xl font-black text-white">
              {files.length}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Items secured in database</p>
          </div>
          <div className="text-[10px] text-zinc-500">
            {aiSummarizedCount} items summarized by Creator AI
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 rounded-2xl bg-[#131316]/60 border border-white/5 flex flex-col justify-between h-40">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Quick Actions
          </span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Link 
              href="/upload"
              className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer group"
            >
              Upload Asset
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              href="/search"
              className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer group"
            >
              Search Vault
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              href="/categories"
              className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer group"
            >
              Categories
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link 
              href="/settings"
              className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-purple-600/15 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer group"
            >
              Settings
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Clickable Categories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            Categories Analytics (Click to filter)
          </h2>
          {selectedCategoryFilter && (
            <button 
              onClick={() => setSelectedCategoryFilter(null)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryStats).map(([catName, count]) => {
            const Icon = getCategoryIcon(catName);
            const isSelected = selectedCategoryFilter === catName;
            return (
              <button 
                key={catName} 
                onClick={() => setSelectedCategoryFilter(isSelected ? null : catName)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all group cursor-pointer hover:-translate-y-1 ${
                  isSelected 
                    ? 'bg-purple-600/15 border-purple-500 shadow-[0_8px_30px_rgb(168,85,247,0.12)] scale-[1.02]' 
                    : 'bg-[#131316]/50 border-white/5 hover:border-purple-500/30'
                }`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-purple-500/20 border-purple-500/40' : 'bg-purple-500/10 border-purple-500/15 group-hover:bg-purple-500/20'
                  }`}>
                    <Icon className="w-4.5 h-4.5 text-purple-400" />
                  </div>
                  <span className="text-2xl font-black text-white">{count}</span>
                </div>
                <span className={`text-xs font-bold transition-colors ${
                  isSelected ? 'text-purple-300' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  {catName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel - Uploads Table */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Recent Uploads
                {selectedCategoryFilter && (
                  <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                    {selectedCategoryFilter}
                  </span>
                )}
              </h2>
            </div>
            
            {/* Internal search filter */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by name, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Files Table / List */}
          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<Upload className="w-6 h-6" />}
              title={searchQuery || selectedCategoryFilter ? 'No assets found' : 'Your vault is ready'}
              description={searchQuery || selectedCategoryFilter ? 'Try a different keyword or upload new content.' : 'Upload your first asset to start building your second brain.'}
              action={
                !searchQuery && !selectedCategoryFilter ? (
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                  >
                    Upload File
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-bold text-zinc-500">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Uploaded</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <button 
                          onClick={() => handlePreview(file)}
                          className="font-semibold text-white hover:text-purple-400 transition-colors flex items-center gap-2 max-w-[150px] sm:max-w-xs truncate cursor-pointer text-left"
                        >
                          <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="truncate">{file.file_name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 shrink-0" />
                        </button>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950/40 text-purple-300 border border-purple-900/40">
                          {file.category}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-zinc-500">
                        {new Date(file.uploaded_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(file)}
                            title="Download/View File"
                            className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            disabled={deletingId === file.id}
                            title="Delete File"
                            className="p-2 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-950/40 hover:border-red-500/25 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === file.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - Timeline Log & System Specs */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h2>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No recent uploads or actions found.</p>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 5).map((log, idx) => (
                <div key={log.id} className="relative flex gap-3 pb-1">
                  {idx !== Math.min(activities.length, 5) - 1 && (
                    <span className="absolute left-3.5 top-7 bottom-0 w-[1px] bg-white/5" />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    log.action === 'Deleted' ? 'bg-red-500/10 border-red-500/20' : 'bg-purple-500/10 border-purple-500/20'
                  }`}>
                    {log.action === 'Deleted' ? (
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs text-zinc-300 line-clamp-2">
                      <span className={log.action === 'Deleted' ? 'text-red-400 font-semibold' : 'text-purple-400 font-semibold'}>
                        {log.action}
                      </span>{' '}
                      "{log.fileName}"
                    </p>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{getTimeLabel(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips section */}
          <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/10 space-y-2 mt-6">
            <h3 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Creator Tip
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Unlock the power of your knowledge vault by uploading PDF scripts. CreatorVault AI extracts outline structures to expedite editing workflows.
            </p>
          </div>
        </div>
      </div>
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
