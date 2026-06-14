import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Prevent open redirect vulnerabilities by ensuring next is a safe relative path
  let safeRedirect = '/dashboard';
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    safeRedirect = next;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Direct user to the target path
      return NextResponse.redirect(`${origin}${safeRedirect}`);
    }
  }

  // If there's an error, redirect to a login error page
  return NextResponse.redirect(`${origin}/login?error=Could not exchange auth code for session`);
}
