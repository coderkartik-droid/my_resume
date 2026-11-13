import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Compact editorial banner used at the top of every inner route so each page
 * has a clear, premium visual title beneath the fixed navigation.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: PageHeaderProps) {
  return (
    <header className="relative pt-32 sm:pt-36 pb-4 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-6 sm:px-10 relative z-10">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 theme-badge text-[10px] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-mono font-bold uppercase tracking-[0.2em] text-sky-300">
              {eyebrow}
            </span>
          </div>
        )}

        <h1 className="font-heading font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-5 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        )}

        <div
          className="mt-8 h-[2px] w-32 rounded-full"
          style={{
            background: "linear-gradient(90deg, #5145E5 0%, #38BDF8 60%, #A78BFA 100%)",
            boxShadow: "0 0 14px rgba(56, 189, 248, 0.45)",
          }}
        />

        {children}
      </div>
    </header>
  );
}
