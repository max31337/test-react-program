"use client";
import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }
  // Render a stable placeholder on the server to avoid hydration mismatch.
  if (!mounted) {
    return (
      <button
        aria-hidden="true"
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm ${className}`}
        suppressHydrationWarning
        tabIndex={-1}
      >
        <span className="h-5 w-5 rounded-full bg-neutral-300 dark:bg-neutral-600 animate-pulse" />
      </button>
    );
  }
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      <Sun className={"h-5 w-5 text-yellow-500 transition-opacity " + (dark ? 'opacity-0' : 'opacity-100')} />
      <Moon className={"absolute h-5 w-5 text-blue-400 transition-opacity " + (dark ? 'opacity-100' : 'opacity-0')} />
    </button>
  );
}
