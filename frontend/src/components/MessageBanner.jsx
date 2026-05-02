import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const TYPES = {
  success: {
    icon: <CheckCircle2 size={18} />,
    classes: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
    bar: 'bg-emerald-500'
  },
  error: {
    icon: <AlertCircle size={18} />,
    classes: 'border-rose-500/20 bg-rose-500/10 text-rose-600',
    bar: 'bg-rose-500'
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    classes: 'border-amber-500/20 bg-amber-500/10 text-amber-600',
    bar: 'bg-amber-500'
  },
  info: {
    icon: <Info size={18} />,
    classes: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
    bar: 'bg-blue-600'
  }
};

export function MessageBanner({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    if (message?.text) {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300); // Wait for exit animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message?.text) return null;

  const config = TYPES[message.type] || TYPES.info;

  return (
    <div className={`
      fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-[100]
      transition-all duration-500 ease-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
    `}>
      <div className={`
        relative flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
        ${config.classes}
      `}>
        {/* Progress bar line (Visual timer) */}
        <div className={`absolute bottom-0 left-0 h-1 rounded-full opacity-40 transition-all duration-[5000ms] ease-linear ${isVisible ? 'w-full' : 'w-0'} ${config.bar}`} />

        <div className="shrink-0">
          {config.icon}
        </div>

        <div className="flex-1 text-sm font-bold tracking-tight">
          {message.text}
        </div>

        {onClose && (
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}