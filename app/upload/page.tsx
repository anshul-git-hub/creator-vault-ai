import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadForm from './upload-form';

export const dynamic = 'force-dynamic';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('creator_type')
    .eq('user_id', user.id)
    .single();

  return (
    <UploadForm userId={user.id} creatorType={profile?.creator_type} />
  );
}
