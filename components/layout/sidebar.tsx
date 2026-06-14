'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Brain, 
  LayoutDashboard, 
  UploadCloud, 
  Search as SearchIcon, 
  LogOut, 
  Menu, 
  X,
  User,
  Database,
  Settings
} from 'lucide-react';

interface SidebarProps {
  userEmail: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload File', href: '/upload', icon: UploadCloud },
    { name: 'Search Vault', href: '/search', icon: SearchIcon },
    { name: 'Categories', href: '/categories', icon: Database },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 border-b border-white/5 bg-[#09090b] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm tracking-tight text-white">CreatorVault</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#0d0d11] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 py-6 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 h-10">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <span className="font-bold text-base tracking-tight text-white font-sans">
              CreatorVault<span className="text-purple-400">AI</span>
            </span>
            {/* Mobile Close Button */}
            <button 
              className="md:hidden ml-auto text-zinc-500 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/15 border border-purple-500/25 text-purple-300 shadow-inner'
                      : 'text-zinc-400 hover:bg-white/5 border border-transparent hover:text-white'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-purple-400' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-white/5 bg-[#09090b]/40 flex flex-col gap-3">
          <Link 
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-purple-600/10 group-hover:text-purple-400 group-hover:border-purple-500/20 transition-all">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {userEmail.split('@')[0]}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/15 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
}
