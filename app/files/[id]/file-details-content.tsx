'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Calendar, 
  FileText, 
  Sparkles, 
  Lock,
  Loader2,
  HardDrive,
  Eye,
  Volume2
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

interface FileDetailsContentProps {
  file: FileRow;
  userId: string;
}

export default function FileDetailsContent({ file, userId }: FileDetailsContentProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

  // AI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function getPreviewData() {
      try {
        setLoadingPreview(true);
        const pathParts = file.storage_url.split('/creator-files/');
        const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

        const { data, error } = await supabase.storage
          .from('creator-files')
          .createSignedUrl(storagePath, 3600); // 1 hour validity

        if (error) throw error;
        if (data?.signedUrl) {
          setPreviewUrl(data.signedUrl);

          // If it's a text file, let's fetch its text content
          const isText = 
            file.file_type.startsWith('text/') || 
            file.file_name.endsWith('.txt') || 
            file.file_name.endsWith('.md') ||
            file.file_name.endsWith('.csv');

          if (isText) {
            try {
              setLoadingText(true);
              const res = await fetch(data.signedUrl);
              const text = await res.text();
              setTextContent(text);
            } catch (err) {
              console.error('Failed to fetch text content:', err);
              setTextContent('Failed to load text preview content.');
            } finally {
              setLoadingText(false);
            }
          }
        }
      } catch (err) {
        console.error('Error generating preview URL:', err);
      } finally {
        setLoadingPreview(false);
      }
    }
    getPreviewData();
  }, [file, userId, supabase.storage]);

  const handleDownload = async () => {
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
      alert('Error fetching download link: ' + (err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${file.file_name}"?`)) return;

    try {
      setDeleting(true);

      const pathParts = file.storage_url.split('/creator-files/');
      const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;

      // Remove from Storage
      await supabase.storage.from('creator-files').remove([storagePath]);

      // Remove from Database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      alert('Error deleting file: ' + (err as Error).message);
      setDeleting(false);
    }
  };

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);
      setGeneratedText('');

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: file.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI insights');

      // Simulate typewriter effect with word-by-word streaming animation
      const fullText = data.aiSummary;
      let currentText = '';
      const words = fullText.split(' ');
      let wordIndex = 0;

      const timer = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setGeneratedText(currentText);
          wordIndex++;
        } else {
          clearInterval(timer);
          setIsGenerating(false);
          router.refresh();
        }
      }, 35); // Fast, premium typewriter feel
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred during AI analysis';
      alert(errMsg);
      setIsGenerating(false);
    }
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render preview component
  const renderPreview = () => {
    if (loadingPreview) {
      return (
        <div className="h-64 flex flex-col items-center justify-center gap-3 border border-white/5 rounded-2xl bg-white/[0.01]">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <p className="text-xs text-zinc-500">Preparing secure preview stream...</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] flex flex-col items-center gap-3">
          <FileText className="w-8 h-8 text-zinc-500" />
          <div>
            <p className="text-xs text-zinc-400 font-semibold">Preview Unavailable</p>
            <p className="text-[10px] text-zinc-600 mt-1">Files can still be accessed via direct download.</p>
          </div>
        </div>
      );
    }

    const fileType = file.file_type.toLowerCase();

    // 1. Image Preview
    if (fileType.startsWith('image/')) {
      return (
        <div className="relative group rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 flex items-center justify-center p-4 min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewUrl} 
            alt={file.file_name} 
            className="max-w-full h-auto max-h-[500px] object-contain rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.01]" 
          />
        </div>
      );
    }

    // 2. PDF Preview
    if (fileType === 'application/pdf') {
      return (
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40">
          <iframe 
            src={previewUrl} 
            title={file.file_name}
            className="w-full h-[550px] border-0" 
          />
        </div>
      );
    }

    // 3. Video Preview
    if (fileType.startsWith('video/')) {
      return (
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-black">
          <video 
            src={previewUrl} 
            controls 
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      );
    }

    // 4. Audio Preview
    if (fileType.startsWith('audio/')) {
      return (
        <div className="p-6 rounded-2xl border border-white/5 bg-[#131316]/80 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate max-w-[200px]">{file.file_name}</p>
              <p className="text-[10px] text-zinc-500">Audio playback stream</p>
            </div>
          </div>
          <audio src={previewUrl} controls className="w-full mt-2" />
        </div>
      );
    }

    // 5. Text Preview
    const isText = 
      fileType.startsWith('text/') || 
      file.file_name.endsWith('.txt') || 
      file.file_name.endsWith('.md') ||
      file.file_name.endsWith('.csv');

    if (isText) {
      if (loadingText) {
        return (
          <div className="h-32 flex flex-col items-center justify-center gap-2 border border-white/5 rounded-2xl bg-white/[0.01]">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <p className="text-[10px] text-zinc-500">Reading text stream...</p>
          </div>
        );
      }
      return (
        <div className="rounded-2xl border border-white/5 bg-[#09090b]/80 p-5 font-mono text-xs text-zinc-300 overflow-auto max-h-[450px] whitespace-pre-wrap leading-relaxed shadow-inner">
          {textContent || 'Empty file content.'}
        </div>
      );
    }

    // 6. Generic Fallback Card
    return (
      <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01] flex flex-col items-center gap-3">
        <FileText className="w-10 h-10 text-zinc-500" />
        <div>
          <p className="text-xs text-zinc-400 font-bold">Unsupported Inline Preview</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            This format ({file.file_type}) can be viewed by downloading to your device.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Download Asset
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Title, metadata, download actions & preview panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="space-y-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-900/40 uppercase tracking-wider">
                  {file.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words">
                  {file.file_name}
                </h1>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Format</p>
                  <p className="text-xs font-semibold text-white mt-0.5 truncate max-w-[120px]">{file.file_type}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <HardDrive className="w-4 h-4 text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Size</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{formatSize(file.file_size)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Uploaded</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                Download Asset
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-red-950/25 border border-red-500/10 text-red-400 hover:bg-red-950/40 hover:border-red-500/25 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>

          {/* Inline Preview */}
          <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-4">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Secure Asset Preview
            </h2>
            {renderPreview()}
          </div>
        </div>

        {/* Right Column: AI Assistant & Outline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Creator Intelligence</h2>
              </div>
            </div>

            {/* Displaying persistent database AI summary if present */}
            {file.ai_summary && !isGenerating && (
              <div className="space-y-4">
                <div className="prose prose-invert prose-sm text-zinc-300 leading-relaxed space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {/* Visual Formatting for custom Markdown summary returned by API */}
                  <div 
                    className="space-y-4 text-xs select-text" 
                    dangerouslySetInnerHTML={{ 
                      __html: file.ai_summary
                        .replace(/### (.*)/g, '<h3 class="text-sm font-bold text-white mt-4 border-b border-white/5 pb-1">$1</h3>')
                        .replace(/\*\*"(.*)"\*\*/g, '<strong class="text-purple-300">"$1"</strong>')
                        .replace(/- \*\*(.*)\*\*/g, '<li><strong>$1</strong>')
                        .replace(/> \[\!TIP\]\s*(.*)/g, '<div class="p-3 bg-purple-950/15 border border-purple-500/20 text-purple-300 rounded-xl mt-2">$1</div>')
                        .replace(/- (.*)/g, '• $1<br/>')
                    }} 
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Regenerate AI Analysis
                </button>
              </div>
            )}

            {/* If currently generating (Streaming Typewriter effect) */}
            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs text-purple-400 font-bold uppercase tracking-wider">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  AI agent transcribing & critiqueing...
                </div>
                <div className="rounded-xl bg-purple-950/5 border border-purple-500/10 p-5 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto min-h-[250px]">
                  {generatedText}
                  <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-0.5" />
                </div>
              </div>
            )}

            {/* Empty State / CTA for AI outline generation */}
            {!file.ai_summary && !isGenerating && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  CreatorVault AI automatically creates visual critique maps of your images, transcribes script outlines from document uploads, and generates CTR suggestions to double your audience capture.
                </p>
                <div className="p-4 rounded-xl bg-purple-950/5 border border-purple-950/10 text-[10px] text-zinc-500 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span>Requires secure file details scanning. Data remains encrypted on server.</span>
                </div>
                <button
                  onClick={handleGenerateAI}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-950/20"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generate AI Outline & Insights
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
