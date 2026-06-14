import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { 
  Brain, 
  UploadCloud, 
  Search, 
  FolderLock, 
  ArrowRight, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Users, 
  Database
} from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              CreatorVault<span className="text-purple-400">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#audiences" className="hover:text-white transition-colors">Who is it for?</a>
          </nav>

          <div>
            {user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-950/20"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 font-medium text-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col justify-center py-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 1 Active
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1] bg-gradient-to-b from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            The Second Brain for Content Creators
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Upload, organize, and retrieve your scripts, thumbnail references, brand assets, and content ideas. Stop losing references in messy folders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white text-base shadow-xl shadow-purple-950/30 transition-all flex items-center justify-center gap-2"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white text-base shadow-xl shadow-purple-950/30 transition-all flex items-center justify-center gap-2"
              >
                Start Your Vault Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-zinc-300 text-base transition-all flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="py-16 border-t border-white/5 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Designed for Speed and Organization</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Built from the ground up to support high-velocity content production.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-2xl glow-purple hover:border-purple-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <UploadCloud className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Secure Private Storage</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                All creator files are stored securely in Supabase Private storage buckets. Your uploads remain fully encrypted under individual user folders.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl glow-purple hover:border-purple-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Search</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Quickly locate files, scripts, or thumbnails by searching names and categories. Never scroll endlessly looking for an asset again.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl glow-purple hover:border-purple-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <FolderLock className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Granular Categories</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Structure your media with 6 built-in categories specifically chosen for workflow efficiency: Ideas, Scripts, Thumbnails, Assets, Research, and Inspiration.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-16 border-t border-white/5 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Structured for Creators</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">No complex folders. Store files under preconfigured categories designed for speed.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Content Ideas", desc: "Hooks, video topics", icon: Sparkles },
              { name: "Scripts", desc: "Written drafts, outlines", icon: FileText },
              { name: "Thumbnail References", desc: "Design inspiration, mockups", icon: ImageIcon },
              { name: "Brand Assets", desc: "Logos, lower thirds, intros", icon: Database },
              { name: "Research", desc: "Articles, study screenshots", icon: Brain },
              { name: "Inspiration", desc: "Other creators' videos, visual clips", icon: Video }
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 hover:border-purple-500/10 transition-colors">
                  <Icon className="w-5 h-5 text-purple-400 mb-3" />
                  <h4 className="font-bold text-sm text-white mb-1">{cat.name}</h4>
                  <p className="text-xs text-zinc-500 leading-tight">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Target Users */}
        <section id="audiences" className="py-16 border-t border-white/5 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Made For Modern Creators</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Who benefits from CreatorVault AI?</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              "YouTubers",
              "Instagram Creators",
              "Content Editors",
              "Influencers",
              "Agency Owners"
            ].map((role, idx) => (
              <div key={idx} className="bg-zinc-950/60 border border-white/5 rounded-xl p-5 text-center flex flex-col items-center justify-center">
                <Users className="w-5 h-5 text-zinc-500 mb-2" />
                <span className="font-semibold text-sm text-zinc-300">{role}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b] py-8 text-center text-xs text-zinc-600 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 CreatorVault AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
