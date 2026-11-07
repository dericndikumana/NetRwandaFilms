'use client';

import React from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle visual theme"
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-surface hover:bg-brand-surface-hover text-brand-amber border border-brand-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-amber/50"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}

