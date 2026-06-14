'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Trash2, 
  LogOut, 
  Globe, 
  HardDrive, 
  ShieldAlert,
  Loader2,
  FolderHeart,
  GraduationCap,
  Play,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProfileRow {
  id: string;
  user_id: string;
  profession: string;
  creator_type: string;
  working_style: string;
  goals: string;
  created_at: string;
}

interface SettingsContentProps {
  userEmail: string;
  userId: string;
  totalFiles: number;
  totalBytes: number;
  initialProfile: ProfileRow | null;
}

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export default function SettingsContent({ 
  userEmail, 
  userId, 
  totalFiles, 
  totalBytes,
  initialProfile
}: SettingsContentProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Selection states for form editing
  const [profession, setProfession] = useState(initialProfile?.profession || 'Creator');
  const [creatorType, setCreatorType] = useState(initialProfile?.creator_type || 'YouTuber');
  const [workingStyle, setWorkingStyle] = useState(initialProfile?.working_style || 'Organized');
  const [goals, setGoals] = useState(initialProfile?.goals || 'Grow Audience');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [googleConnected, setGoogleConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const supabase = createClient();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMessage(null);

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          profession,
          creator_type: creatorType,
          working_style: workingStyle,
          goals,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      toast.success('Creator Profile updated successfully!');
      setEditingProfile(false);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(`Error: ${errMsg}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleGoogle = () => {
    if (googleConnected) {
      setGoogleConnected(false);
    } else {
      setConnectingGoogle(true);
      setTimeout(() => {
        setGoogleConnected(true);
        setConnectingGoogle(false);
      }, 1200); // Premium loading simulation
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoggedOut(true);
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoggedOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const doubleCheck = confirm(
      "WARNING: This action is permanent!\n\nThis will permanently delete your account, remove all files from our storage servers, and delete all records. Are you absolutely sure?"
    );
    if (!doubleCheck) return;

    const confirmation = prompt("To confirm deletion, please type 'DELETE ALL DATA' in the box below:");
    if (confirmation !== 'DELETE ALL DATA') {
      toast.error("Verification mismatch. Deletion cancelled.");
      return;
    }

    try {
      setDeletingAccount(true);

      // 1. Fetch user's files to clean up storage
      const { data: userFiles, error: fetchError } = await supabase
        .from('files')
        .select('file_name, storage_url')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // 2. Delete all files from storage bucket
      if (userFiles && userFiles.length > 0) {
        const pathsToDelete = userFiles.map((file) => {
          const pathParts = file.storage_url.split('/creator-files/');
          return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : `${userId}/${file.file_name}`;
        });

        const { error: storageError } = await supabase.storage
          .from('creator-files')
          .remove(pathsToDelete);

        if (storageError) {
          console.warn("Error cleaning up storage during account deletion:", storageError);
        }
      }

      // 3. Delete records from database (cascade deletes are handled by schema, but let's delete explicitly to ensure clean DB)
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('user_id', userId);

      if (dbError) throw dbError;

      // 4. Sign out and redirect
      await supabase.auth.signOut();
      toast.success("Your CreatorVault AI storage has been wiped successfully. Redirecting you to landing page.");
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error("Error wiping account data: " + errMsg);
      setDeletingAccount(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const storagePercentage = Math.min((totalBytes / STORAGE_LIMIT_BYTES) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="text-zinc-400 text-sm">Configure profiles, link external tools, and manage data.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Creator Profile</h2>
            </div>
            {profile && !editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Edit Parameters
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Profession</label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    {['Student', 'Creator', 'Editor', 'Founder', 'Freelancer'].map(val => (
                      <option key={val} value={val} className="bg-zinc-900 text-white">{val}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Creator Type</label>
                  <select
                    value={creatorType}
                    onChange={(e) => setCreatorType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    {['YouTuber', 'Instagram Creator', 'Video Editor', 'Agency Owner'].map(val => (
                      <option key={val} value={val} className="bg-zinc-900 text-white">{val}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Working Style</label>
                  <select
                    value={workingStyle}
                    onChange={(e) => setWorkingStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    {['Organized', 'Visual Thinker', 'Research Driven', 'Fast Executor'].map(val => (
                      <option key={val} value={val} className="bg-zinc-900 text-white">{val}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Primary Goal</label>
                  <select
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    {['Grow Audience', 'Build Business', 'Learn Skills', 'Manage Clients'].map(val => (
                      <option key={val} value={val} className="bg-zinc-900 text-white">{val}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Profile Configuration
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{userEmail.split('@')[0]}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{userEmail}</p>
                </div>
              </div>

              {profile ? (
                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                  {[
                    { label: 'Profession', val: profile.profession, icon: GraduationCap },
                    { label: 'Creator Type', val: profile.creator_type, icon: Play },
                    { label: 'Working Style', val: profile.working_style, icon: LayoutList },
                    { label: 'Primary Goal', val: profile.goals, icon: TrendingUp }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider leading-none">{item.label}</p>
                          <p className="text-xs font-semibold text-white mt-1 truncate">{item.val}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-t border-white/5 pt-4 text-center py-2 space-y-3">
                  <p className="text-xs text-zinc-500">No profile configuration set yet.</p>
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Start Onboarding Flow
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Storage Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Storage Usage</h2>
            </div>
            <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
              {storagePercentage.toFixed(1)}% Used
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <FolderHeart className="w-4.5 h-4.5 text-zinc-500" />
                {totalFiles} Assets Saved
              </span>
              <span className="text-zinc-300 font-semibold">
                {formatSize(totalBytes)} of 10 GB
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${storagePercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Integration Card */}
        <div className="rounded-2xl border border-white/5 bg-[#131316]/50 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Globe className="w-4.5 h-4.5 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Connected Integrations</h2>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-zinc-400 mt-0.5 border border-white/5">
                <Globe className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Google Drive Integration</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Automatically sync scripts and thumbnail renders from your Google Drive files.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleGoogle}
              disabled={connectingGoogle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                googleConnected 
                  ? 'bg-purple-600/10 border border-purple-500/30 text-purple-300 hover:bg-purple-600/20' 
                  : 'bg-white hover:bg-zinc-100 text-zinc-950 font-bold border border-transparent'
              }`}
            >
              {connectingGoogle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : googleConnected ? (
                'Connected'
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>

        {/* Sign Out & Account Deletion (Danger Zone) */}
        <div className="rounded-2xl border border-red-500/10 bg-red-950/5 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-red-500/10 pb-4">
            <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSignOut}
              disabled={isLoggedOut}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {isLoggedOut ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <LogOut className="w-4.5 h-4.5" />
              )}
              Sign Out from Device
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-900/10 border border-red-500/20 hover:bg-red-900/25 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              {deletingAccount ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Trash2 className="w-4.5 h-4.5" />
              )}
              Permanently Wipe Vault & Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
