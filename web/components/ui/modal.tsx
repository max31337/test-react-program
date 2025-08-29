"use client";
import React, { useEffect } from 'react';
import { cn } from './cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, className, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    // Lock scroll to stop background (map) interaction on mobile
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={cn('relative z-10 w-full max-w-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg focus:outline-none', className)}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pt-4 pb-2 border-b border-neutral-200 dark:border-neutral-700">{children}</div>;
}
export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold tracking-wide">{children}</h2>;
}
export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-4 text-sm space-y-3">{children}</div>;
}
export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pt-2 pb-4 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-700">{children}</div>;
}
