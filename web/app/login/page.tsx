"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Globe2, Radar, History, MapPin, ShieldCheck, MoonStar, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('password1');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
  const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(data.message || 'Login failed');
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('authed', 'true');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Main two-column layout */}
  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
  {/* Brand Panel (lg and up) */}
  <div className="hidden lg:flex relative overflow-hidden">
          {/* Base gradient swaps in dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors" />
          {/* Soft radial texture (tone adjusted for dark) */}
          <div className="absolute inset-0 opacity-30 dark:opacity-40 mix-blend-overlay" style={{backgroundImage:'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 60%)'}} />
          {/* Accent glows (swap to subtle desaturated glows in dark) */}
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/30 dark:bg-blue-500/10 blur-3xl transition-colors" />
          <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/30 dark:bg-indigo-500/10 blur-3xl transition-colors" />
          <div className="relative z-10 flex flex-col justify-center px-14 py-16 text-white dark:text-neutral-100 gap-8 max-w-lg transition-colors">
      <Link href="/" className="flex items-center gap-5 group" aria-label="Back to landing">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-white/20 blur-xl" />
                <div className="relative rounded-full bg-gradient-to-br from-white via-blue-50 to-blue-200 p-4 shadow-lg ring-2 ring-white/40">
                  <Globe2 className="h-14 w-14 text-blue-600" />
                </div>
              </div>
              <div className="flex flex-col">
        <h1 className="text-4xl font-extrabold tracking-tight leading-none group-hover:brightness-110 transition">GeoScope</h1>
                <span className="text-xs tracking-[0.35em] uppercase font-medium text-blue-100/90">IP Intelligence</span>
              </div>
      </Link>
            <p className="text-sm leading-relaxed text-blue-50/90 dark:text-neutral-300">
              Search and visualize IP geolocation instantly. Explore location, ISP, and map data with a refined dark/light experience.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <FeatureBit icon={<Radar className="h-4 w-4" />} label="Real‑time Lookup" />
              <FeatureBit icon={<History className="h-4 w-4" />} label="History" />
              <FeatureBit icon={<MapPin className="h-4 w-4" />} label="Interactive Map" />
              <FeatureBit icon={<ShieldCheck className="h-4 w-4" />} label="JWT Secure" />
              <FeatureBit icon={<MoonStar className="h-4 w-4" />} label="Dark / Light" />
              <FeatureBit icon={<Globe2 className="h-4 w-4" />} label="Self IP Detect" />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-blue-100/60 dark:text-neutral-500">Demo accounts pre-seeded • No tracking</p>
          </div>
        </div>
        {/* Form Panel */}
  <div className="flex flex-col items-center justify-start md:items-center md:justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-b from-background to-background/80">
          <div className="md:hidden w-full max-w-sm mt-2 mb-6">
            <Link href="/" className="flex items-center gap-2 justify-center" aria-label="Back to landing">
              <div className="relative inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-neutral-800 p-2 ring-1 ring-blue-200/60 dark:ring-neutral-700">
                <Globe2 className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">GeoScope</span>
            </Link>
          </div>
          <Card className="w-full max-w-sm shadow-sm border-neutral-200 dark:border-neutral-700/60 bg-white/90 dark:bg-neutral-900/70 backdrop-blur-sm relative">
            <CardHeader className="pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-700/40">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>Use a demo account below.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <CardContent className="space-y-5 pt-0 pb-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="user1@example.com" autoComplete="email" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="password1"
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={()=>setShowPwd(p=>!p)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded">{error}</p>}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Demo Users</p>
                    <ul className="space-y-0.5">
                      <li className="font-mono">user1@example.com</li>
                      <li className="font-mono">user2@example.com</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">Password</p>
                    <p className="font-mono">password1</p>
                    <p className="font-mono">password2</p>

                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-neutral-200/70 dark:border-neutral-700/40 mt-1">
                <Button type="submit" className="w-full h-11 text-sm font-medium">Login</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeatureBit({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-white/10 backdrop-blur-sm px-2 py-1 border border-white/20 shadow-sm">
      <span className="text-blue-50/90">{icon}</span>
      <span className="font-medium tracking-tight text-blue-50/90">{label}</span>
    </div>
  );
}
