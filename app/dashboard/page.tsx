import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardContent from './dashboard-content';

// Force dynamic rendering since we are reading from cookies (via createClient)
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's files ordered by creation date
  const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
  }

  // Fetch user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
  }

  return (
    <DashboardContent 
      initialFiles={files || []} 
      userId={user.id} 
      profile={profile || null}
      userEmail={user.email}
      userFullName={user.user_metadata?.full_name}
    />
  );
}
