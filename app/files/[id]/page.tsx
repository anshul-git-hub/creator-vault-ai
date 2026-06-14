import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FileDetailsContent from './file-details-content';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FileDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FileDetailsPage({ params }: FileDetailsPageProps) {
  const resolvedParams = await params;
  const fileId = resolvedParams.id;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the specific file and ensure it belongs to the user
  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single();

  if (error || !file) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/10 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">File Not Found</h1>
          <p className="text-sm text-zinc-400 mt-2">
            The file you are looking for does not exist or you do not have permission to view it.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <FileDetailsContent 
      file={file} 
      userId={user.id} 
    />
  );
}
