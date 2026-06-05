import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Card({ children, className = '', glass = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-200',
        glass
          ? 'glass shadow-[var(--shadow-lg)]'
          : 'bg-[var(--surface)] shadow-[var(--shadow)]',
        'text-[var(--text-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = ({ children, className = '' }) => (
  <div className={cn('mb-4 flex flex-col gap-1', className)}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={cn('flex-1', className)}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={cn('mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]', className)}>
    {children}
  </div>
);
