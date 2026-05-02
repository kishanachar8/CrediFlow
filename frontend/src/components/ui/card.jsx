import React from 'react';

/**
 * Utility to merge classes safely.
 */
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Card({ children, className = '', ...props }) {
  // Use 'div' or 'article' as default; 'section' is best reserved for titled document areas
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]',
        'text-[var(--text)] p-6 shadow-[var(--shadow)] backdrop-blur-xl',
        'overflow-hidden transition-all duration-300', // Added for better hover/child containment
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-components for better structure
Card.Header = ({ children, className = '' }) => (
  <div className={cn('mb-4 flex flex-col gap-1', className)}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={cn('flex-1', className)}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={cn('mt-6 flex items-center justify-end gap-3', className)}>{children}</div>
);