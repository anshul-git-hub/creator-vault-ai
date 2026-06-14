import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CategoriesContent from './categories-content';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all user's files to group them by category
  const { data: files, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching files in categories page:', error);
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('creator_type')
    .eq('user_id', user.id)
    .single();

  return (
    <CategoriesContent 
      initialFiles={files || []} 
      userId={user.id} 
      creatorType={profile?.creator_type}
    />
  );
}
