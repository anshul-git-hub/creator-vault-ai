import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from './sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user has completed onboarding by checking for profile existence
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
