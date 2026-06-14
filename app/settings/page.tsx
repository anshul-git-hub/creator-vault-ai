import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SettingsContent from './settings-content';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the count of files to show user statistics in settings
  const { data: files } = await supabase
    .from('files')
    .select('id, file_size')
    .eq('user_id', user.id);

  const totalFiles = files?.length || 0;
  const totalBytes = files?.reduce((acc, f) => acc + (Number(f.file_size) || 0), 0) || 0;

  // Fetch creator profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <SettingsContent 
      userEmail={user.email ?? ''} 
      userId={user.id}
      totalFiles={totalFiles}
      totalBytes={totalBytes}
      initialProfile={profile}
    />
  );
}
