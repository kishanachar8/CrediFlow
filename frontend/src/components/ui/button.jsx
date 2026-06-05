import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white ' +
    'shadow-[0_4px_15px_rgba(99,102,241,0.35)] ' +
    'hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:-translate-y-px ' +
    'active:translate-y-0 active:shadow-[0_2px_8px_rgba(99,102,241,0.3)]',

  secondary:
    'bg-[var(--surface-strong)] border border-[var(--border)] text-[var(--text-primary)] ' +
    'hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow)]',

  outline:
    'bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] ' +
    'hover:bg-[var(--surface-muted)] hover:border-blue-400',

  destructive:
    'bg-gradient-to-r from-rose-500 to-rose-600 text-white ' +
    'shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_8px_25px_rgba(244,63,94,0.45)]',

  ghost:
    'bg-transparent text-[var(--text-secondary)] ' +
    'hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] border border-transparent',
};

export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold',
        'transition-all duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.97]',
        VARIANTS[variant] || VARIANTS.primary,
        className
      )}
      {...props}
    />
  );
}
