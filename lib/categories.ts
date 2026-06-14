import { 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Database, 
  Brain, 
  Video,
  Play,
  TrendingUp,
  Calendar,
  Handshake,
  Music,
  LayoutTemplate,
  Users,
  Briefcase,
  FileSignature,
  FileCheck,
  type LucideIcon
} from 'lucide-react';

export const CATEGORY_MAP: Record<string, string[]> = {
  'YouTuber': ['Hooks', 'Scripts', 'Thumbnail Ideas', 'Competitor Research', 'Sponsorships'],
  'Instagram Creator': ['Reels Ideas', 'Hooks', 'Trends', 'Content Calendar', 'Brand Collaborations'],
  'Video Editor': ['Assets', 'Sound Effects', 'Transitions', 'References', 'Templates'],
  'Agency Owner': ['Clients', 'Projects', 'Contracts', 'Brand Assets', 'Growth'],
};

export const DEFAULT_CATEGORIES = [
  'Content Ideas', 
  'Scripts', 
  'Thumbnail References', 
  'Brand Assets', 
  'Research', 
  'Inspiration'
];

export function getCreatorCategories(creatorType?: string | null): string[] {
  if (!creatorType) return DEFAULT_CATEGORIES;
  return CATEGORY_MAP[creatorType] || DEFAULT_CATEGORIES;
}

export function getCategoryIcon(categoryName: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    // YouTuber
    'Hooks': Sparkles,
    'Scripts': FileText,
    'Thumbnail Ideas': ImageIcon,
    'Competitor Research': Brain,
    'Sponsorships': Handshake,
    // Instagram Creator
    'Reels Ideas': Play,
    'Trends': TrendingUp,
    'Content Calendar': Calendar,
    'Brand Collaborations': Handshake,
    // Video Editor
    'Assets': Database,
    'Sound Effects': Music,
    'Transitions': Video,
    'References': ImageIcon,
    'Templates': LayoutTemplate,
    // Agency Owner
    'Clients': Users,
    'Projects': Briefcase,
    'Contracts': FileSignature,
    'Brand Assets': Database,
    'Growth': TrendingUp,
    // Default
    'Content Ideas': Sparkles,
    'Thumbnail References': ImageIcon,
    'Research': Brain,
    'Inspiration': Video,
  };

  return iconMap[categoryName] || FileCheck;
}
