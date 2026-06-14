'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  GraduationCap, 
  Sparkles, 
  Video, 
  Briefcase, 
  Laptop, 
  Play, 
  Camera, 
  Film, 
  Building, 
  LayoutList, 
  Palette, 
  Brain, 
  Zap, 
  TrendingUp, 
  Wallet, 
  BookOpen, 
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock
} from 'lucide-react';

interface OnboardingContentProps {
  userId: string;
}

interface Option {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepConfig {
  title: string;
  description: string;
  field: 'profession' | 'creatorType' | 'workingStyle' | 'goals';
  options: Option[];
}

const STEPS: StepConfig[] = [
  {
    title: 'What is your primary profession?',
    description: 'Select the role that best describes your daily focus and work life.',
    field: 'profession',
    options: [
      { value: 'Student', label: 'Student', description: 'Learning, preparing, and refining workflows.', icon: GraduationCap },
      { value: 'Creator', label: 'Creator', description: 'Publishing content, scripts, and media platforms.', icon: Sparkles },
      { value: 'Editor', label: 'Editor', description: 'Assembling, pacing, and polishing digital assets.', icon: Video },
      { value: 'Founder', label: 'Founder', description: 'Building startups, brands, and creative businesses.', icon: Briefcase },
      { value: 'Freelancer', label: 'Freelancer', description: 'Delivering client work and self-managing gigs.', icon: Laptop },
    ]
  },
  {
    title: 'Which creator type fits you best?',
    description: 'Select the medium where you direct most of your visual execution.',
    field: 'creatorType',
    options: [
      { value: 'YouTuber', label: 'YouTuber', description: 'Creating long-form scripts and video concepts.', icon: Play },
      { value: 'Instagram Creator', label: 'Instagram Creator', description: 'Engaging feeds, shorts, aesthetics, and clips.', icon: Camera },
      { value: 'Video Editor', label: 'Video Editor', description: 'Trimming timelines, assets, and narrative outlines.', icon: Film },
      { value: 'Agency Owner', label: 'Agency Owner', description: 'Structuring projects, resources, and editor groups.', icon: Building },
    ]
  },
  {
    title: 'What is your primary working style?',
    description: 'Select the operational instinct you follow to execute ideas.',
    field: 'workingStyle',
    options: [
      { value: 'Organized', label: 'Organized', description: 'Methodical files, clear tags, structured categories.', icon: LayoutList },
      { value: 'Visual Thinker', label: 'Visual Thinker', description: 'Moodboards, aesthetic references, visual weights.', icon: Palette },
      { value: 'Research Driven', label: 'Research Driven', description: 'Studies, outlines, keywords, script data.', icon: Brain },
      { value: 'Fast Executor', label: 'Fast Executor', description: 'Speed uploads, immediate hooks, rapid feedback loops.', icon: Zap },
    ]
  },
  {
    title: 'What is your main goal right now?',
    description: 'Select the target milestone you want to secure next.',
    field: 'goals',
    options: [
      { value: 'Grow Audience', label: 'Grow Audience', description: 'Improve retention, double CTR, optimize hooks.', icon: TrendingUp },
      { value: 'Build Business', label: 'Build Business', description: 'Sponsor deals, courses, merchandise sales.', icon: Wallet },
      { value: 'Learn Skills', label: 'Learn Skills', description: 'Master outlines, templates, AI prompts.', icon: BookOpen },
      { value: 'Manage Clients', label: 'Manage Clients', description: 'Smooth assets sharing, reviews, and client updates.', icon: MessageSquare },
    ]
  }
];

export default function OnboardingContent({ userId }: OnboardingContentProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({
    profession: '',
    creatorType: '',
    workingStyle: '',
    goals: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleSelectOption = (value: string) => {
    setSelections(prev => ({
      ...prev,
      [currentStep.field]: value
    }));
    setError(null);
  };

  const handleNext = () => {
    if (!selections[currentStep.field]) {
      setError('Please select an option before moving to the next step.');
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Double check all steps are answered
      if (!selections.profession || !selections.creatorType || !selections.workingStyle || !selections.goals) {
        throw new Error('Please make sure you have answered all onboarding questions.');
      }

      // Insert record to profiles
      const { error: dbError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          profession: selections.profession,
          creator_type: selections.creatorType,
          working_style: selections.workingStyle,
          goals: selections.goals
        });

      if (dbError) throw dbError;

      // Successfully saved, push to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Onboarding Save Error:', err);
      const errMsg = err?.message || err?.details || 'Failed to save profile selections.';
      setError(`Database Error: ${errMsg}`);
      setSubmitting(false);
    }
  };

  const selectedValue = selections[currentStep.field];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-purple-400" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              CreatorVault<span className="text-purple-400">Onboarding</span>
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      {/* Main Wizard */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-4xl mx-auto w-full">
        <div className="w-full space-y-8">
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Heading */}
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight animate-in fade-in duration-200">
              {currentStep.title}
            </h1>
            <p className="text-sm text-zinc-400">
              {currentStep.description}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="w-full p-4.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-2xl animate-in zoom-in-95">
              {error}
            </div>
          )}

          {/* Selection Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentStep.options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option.value)}
                  className={`p-6 rounded-2xl border text-left flex flex-col h-44 justify-between transition-all duration-200 group cursor-pointer ${
                    isSelected 
                      ? 'bg-purple-600/15 border-purple-500 shadow-lg shadow-purple-950/20 scale-[1.02]' 
                      : 'bg-[#131316]/50 border-white/5 hover:border-purple-500/20 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-500/5 border-purple-500/10 text-purple-400 group-hover:bg-purple-500/15'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse mt-1.5" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors ${
                      isSelected ? 'text-purple-300' : 'text-white group-hover:text-purple-400'
                    }`}>
                      {option.label}
                    </span>
                    <span className="text-xs text-zinc-500 leading-tight block mt-1 line-clamp-2">
                      {option.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0 || submitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                currentStepIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </button>

            <div className="flex items-center gap-3">
              {submitting && (
                <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating profile...
                </div>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedValue || submitting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-950/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {currentStepIndex === STEPS.length - 1 ? (
                  <>
                    Complete Onboarding
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-zinc-600 relative z-10 flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5 text-zinc-700" />
        <span>Your profile answers configure private templates. Wiped instantly on account deletion.</span>
      </footer>
    </div>
  );
}
