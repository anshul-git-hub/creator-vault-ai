import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  backLink,
  backLabel = 'Back',
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-8 mb-12">
      {/* Dedicated Navigation Bar */}
      {(breadcrumbs || backLink) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 min-h-[64px] pb-4 border-b border-white/5">
          
          {/* Large Premium Back Button */}
          {backLink && (
            <Link
              href={backLink}
              className="inline-flex items-center justify-center h-12 px-5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 active:bg-white/15 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 font-semibold transition-all shrink-0 text-base shadow-sm"
              aria-label={backLabel}
            >
              <ArrowLeft className="w-5 h-5 mr-2.5 -ml-1" />
              <span>{backLabel}</span>
            </Link>
          )}

          {/* High Contrast Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={crumb.label} className="flex items-center gap-2 whitespace-nowrap">
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="text-base font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg px-3 py-1.5"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`text-base px-3 py-1.5 ${isLast ? 'text-white font-bold bg-white/5 rounded-lg border border-white/10 shadow-sm' : 'text-zinc-400 font-semibold'}`}>
                        {crumb.label}
                      </span>
                    )}
                    
                    {!isLast && (
                      <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0" strokeWidth={2.5} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight break-words">
            {title}
          </h1>
          {description && (
            <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
