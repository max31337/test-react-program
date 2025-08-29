"use client";
import Link from 'next/link';
import { Globe2, Radar, History, ShieldCheck, MoonStar, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { FeatureCarousel } from '../components/FeatureCarousel';

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-transparent blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-600/20 via-blue-500/20 to-transparent blur-3xl" />
      </div>
      {/* Hero Section */}
  <section id="top" className="px-6 pt-16 pb-14 mx-auto max-w-6xl text-center flex flex-col items-center gap-8">
        {/* Big Brand Mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-500/30 via-indigo-500/20 to-transparent blur-xl" aria-hidden="true" />
            <div className="relative rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-4 shadow-lg ring-2 ring-blue-500/30 dark:ring-blue-400/20">
              <Globe2 className="h-14 w-14 text-white drop-shadow-md" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">GeoScope</h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em]">IP Intelligence Toolkit</p>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent max-w-4xl leading-tight">
          Search, Analyze & Visualize IP Geolocation Instantly
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
          A fast modern dashboard to look up IP addresses, explore location metadata, keep history, and switch effortlessly between dark & light themes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard"><Button size="lg" className="h-12 px-8 text-base gap-2"><Radar className="h-5 w-5" /> Open Dashboard</Button></Link>
          <Link href="/login"><Button size="lg" variant="secondary" className="h-12 px-8 text-base gap-2"><ShieldCheck className="h-5 w-5" /> Login</Button></Link>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">No tracking. Your queries stay in your session history only.</p>
      </section>

      {/* Features Grid */}
  <section id="features" className="px-0 sm:px-6 pb-24 mx-auto max-w-6xl scroll-mt-28">
        {/* Mobile carousel */}
        <div className="block md:hidden">
          <FeatureCarousel
            items={[
              { icon: Radar, title: 'Real-time Lookup', desc: 'Fetch location, ISP & coordinates instantly.', color: 'blue' },
              { icon: History, title: 'Search History', desc: 'Auto-saved lookups with bulk actions.', color: 'indigo' },
              { icon: MoonStar, title: 'Dark / Light', desc: 'Seamless theme switching and persistence.', color: 'violet' },
              { icon: ShieldCheck, title: 'JWT Auth', desc: 'Secure cookie-based session handling.', color: 'emerald' },
              { icon: MapPin, title: 'Interactive Map', desc: 'Animated map fly transitions & markers.', color: 'rose' },
              { icon: Globe2, title: 'Self IP Detect', desc: 'Resolves your public IP even on localhost.', color: 'amber' }
            ]}
          />
        </div>
        {/* Desktop grid */}
        <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 md:px-0">
          <Feature icon={Radar} title="Real-time Lookup" desc="Quickly fetch location, ISP and coordinates for any IPv4." color="blue" />
          <Feature icon={History} title="Search History" desc="Auto-saved lookups with easy selection & bulk delete." color="indigo" />
          <Feature icon={MoonStar} title="Dark / Light" desc="Instant theme switching with smooth visuals." color="violet" />
          <Feature icon={ShieldCheck} title="JWT Auth" desc="Secure session handling via HTTP-only cookies." color="emerald" />
          <Feature icon={MapPin} title="Interactive Map" desc="Leaflet-powered map with animated fly transitions." color="rose" />
          <Feature icon={Globe2} title="Self IP Detect" desc="Automatically resolves your public IP even on localhost." color="amber" />
        </div>
      </section>

      {/* CTA Footer */}
  <section id="get-started" className="px-6 pb-28 mx-auto max-w-5xl text-center scroll-mt-28">
        <div className="rounded-2xl relative overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-800 p-10 sm:p-14 shadow-lg">
          <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white,transparent)]">
            <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Ready to explore?</h2>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8">Jump into the dashboard to start querying IP addresses or sign in to access your full history and personalized session.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"><Button className="h-11 px-8 gap-2"><Radar className="h-5 w-5" /> Get Started</Button></Link>
            <Link href="/login"><Button variant="outline" className="h-11 px-8 gap-2"><ShieldCheck className="h-5 w-5" /> Sign In</Button></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface FeatureProps {
  icon: any;
  title: string;
  desc: string;
  color: 'blue'|'indigo'|'violet'|'emerald'|'rose'|'amber';
}

function Feature({ icon:Icon, title, desc, color }: FeatureProps) {
  const colorMap: Record<string,string> = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-600/10 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30',
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-600/10 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-600/10 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-600/10 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
  };
  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 inline-flex items-center justify-center rounded-md border text-sm font-medium ${colorMap[color]}`}> <Icon className="h-5 w-5" /> </div>
      <h3 className="font-semibold tracking-tight text-sm">{title}</h3>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">{desc}</p>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
