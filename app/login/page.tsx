import Link from 'next/link';
import LoginForm from './login-form';
import { ArrowLeft, Brain } from 'lucide-react';

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined;
  const next = typeof params.next === 'string' ? params.next : undefined;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto px-6 w-full h-16 flex items-center justify-between relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm tracking-tight">CreatorVault</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <LoginForm errorParam={error} nextParam={next} />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 relative z-10">
        © 2026 CreatorVault AI. All rights reserved.
      </footer>
    </div>
  );
}
