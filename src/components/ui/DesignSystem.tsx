import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
  const sizes = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] sm:min-h-[40px] px-4 py-2 text-sm',
    lg: 'min-h-[46px] px-6 py-2.5 text-sm',
  };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
    secondary:
      'border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141923] text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1B2230]',
    ghost:
      'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextInput({ label, error, helperText, id, className = '', ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] rounded-lg border px-3.5 py-2 text-sm bg-white dark:bg-[#0D1017] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#11151E] ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
}: {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div className="space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>{label}</span>
          {showPercent && <span className="font-mono tabular-nums font-medium">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11151E] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center">
      <div className="mb-3 text-slate-400 dark:text-slate-500">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-600" />
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}
