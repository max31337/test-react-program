"use client";
import React, { useRef, useEffect, useState } from 'react';
import { cn } from './ui/cn';

export interface FeatureItem {
  icon: any;
  title: string;
  desc: string;
  color: 'blue' | 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber';
}

const colorMap: Record<string,string> = {
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-600/10 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
  indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
  violet: 'text-violet-600 dark:text-violet-400 bg-violet-600/10 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-600/10 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-600/10 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
};

export function FeatureCarousel({ items }: { items: FeatureItem[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  // Intersection observer to determine active slide
  useEffect(() => {
    const el = scrollerRef.current; if (!el) return;
    const cards = Array.from(el.querySelectorAll('[data-slide]')) as HTMLElement[];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset.index || '0');
          setActive(idx);
        }
      });
    }, { root: el, threshold: 0.6 });
    cards.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, [items]);

  function scrollTo(idx: number) {
    const el = scrollerRef.current; if (!el) return;
    const target = el.querySelector<HTMLElement>(`[data-slide][data-index='${idx}']`);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function next(delta: number) { scrollTo(Math.min(items.length - 1, Math.max(0, active + delta))); }

  return (
    <div className="relative">
      {/* Gradient edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      <div ref={scrollerRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 scrollbar-thin scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]" style={{scrollSnapType:'x mandatory'}}>
        {/* hide native scrollbar (webkit) */}
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
        {items.map((f, i) => (
          <div
            key={f.title}
            data-slide
            data-index={i}
            className="snap-center shrink-0 w-[78%] xs:w-[70%] basis-[78%] xs:basis-[70%]"
          >
            <div className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm p-5 flex flex-col gap-3 shadow-sm active:scale-[0.97] transition-all">
              <div className={cn('h-10 w-10 inline-flex items-center justify-center rounded-md border text-sm font-medium', colorMap[f.color])}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold tracking-tight text-sm">{f.title}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">{f.desc}</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
      {/* Controls & dots */}
      <div className="mt-2 flex items-center justify-center gap-4">
        <button aria-label="Previous" onClick={()=>next(-1)} disabled={active===0} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs disabled:opacity-40 active:scale-95 transition">
          ‹
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} aria-label={`Go to feature ${i+1}`} onClick={()=>scrollTo(i)} className={cn('h-2.5 w-2.5 rounded-full transition', i===active ? 'bg-blue-600 dark:bg-blue-400 scale-110' : 'bg-neutral-300 dark:bg-neutral-700')} />
          ))}
        </div>
        <button aria-label="Next" onClick={()=>next(1)} disabled={active===items.length-1} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs disabled:opacity-40 active:scale-95 transition">
          ›
        </button>
      </div>
    </div>
  );
}
