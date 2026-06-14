import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SearchContent from './search-content';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's files
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  return (
    <SearchContent 
      initialFiles={files || []} 
      userId={user.id} 
    />
  );
}
