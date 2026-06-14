import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingContent from './onboarding-content';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/onboarding');
  }

  // Check if profile already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // If profile is already created, redirect straight to dashboard
  if (profile) {
    redirect('/dashboard');
  }

  return (
    <OnboardingContent userId={user.id} />
  );
}
