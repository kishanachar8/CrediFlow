import React from 'react';

/**
 * A simple utility to join classes. 
 * If you find yourself needing to override padding or margins frequently,
 * I highly recommend installing 'tailwind-merge' and 'clsx'.
 */
const cn = (...classes) => classes.filter(Boolean).join(' ');

const VARIANTS = {
  primary: 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-glow hover:from-sky-400 hover:to-indigo-400',
  secondary: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-strong)]',
  outline: 'bg-transparent border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-light)]',
  destructive: 'bg-rose-500 text-white hover:bg-rose-600',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-muted)] border border-transparent',
};

export function Button({ 
  variant = 'primary', 
  className = '', 
  type = 'button', // Default to button to prevent accidental form submits
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]';

  const selectedVariant = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      className={cn(baseClasses, selectedVariant, className)}
      {...props}
    />
  );
}