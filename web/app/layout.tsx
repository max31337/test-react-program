"use client";
import './globals.css';
import React from 'react';
import { Sun, Moon, Globe2, LogOut, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ThemeScript() {
  const code = `(() => { try { const p = localStorage.getItem('theme'); if(p==='dark'||(!p&&window.matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); } catch(e){} })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onLanding = pathname === '/';
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {pathname !== '/login' && (
          <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 bg-white/80 dark:bg-neutral-900/80 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Home" className="inline-flex items-center gap-2">
                <Globe2 className="h-6 w-6 text-blue-600" />
                <span className="font-semibold tracking-tight text-base">GeoScope</span>
              </Link>
              {onLanding && (
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                  <a href="#get-started" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Get Started</a>
                </nav>
              )}
            </div>
            <AuthButtons pathname={pathname} />
          </header>
        )}
  <div className={(pathname === '/login' || pathname === '/') ? '' : 'p-4'}>
          {children}
        </div>
      </body>
    </html>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);
  function toggle() {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <Sun className={"h-5 w-5 text-yellow-500 transition-opacity " + (dark ? 'opacity-0' : 'opacity-100')} />
      <Moon className={"absolute h-5 w-5 text-blue-400 transition-opacity " + (dark ? 'opacity-100' : 'opacity-0')} />
    </button>
  );
}

// (Logout removed per new navbar requirements)
function AuthButtons({ pathname }: { pathname: string | null }) {
  const hadAuthedFlag = typeof window !== 'undefined' && localStorage.getItem('authed') === '1';
  const [authed, setAuthed] = React.useState<boolean | null>(hadAuthedFlag ? true : null);
  // If we already have a flag, skip initial verifying spinner for instant Logout display.
  const [verifying, setVerifying] = React.useState(!hadAuthedFlag);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let cancelled = false;
    async function verify() {
      setVerifying(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          setAuthed(true);
          try { localStorage.setItem('authed','1'); } catch {}
        } else {
          setAuthed(false);
          try { localStorage.removeItem('authed'); } catch {}
        }
      } catch {
        if (!cancelled) { setAuthed(false); try { localStorage.removeItem('authed'); } catch {} }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    }
    verify();
    const onFocus = () => verify();
    window.addEventListener('focus', onFocus);
    return () => { cancelled = true; window.removeEventListener('focus', onFocus); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    setLoggingOut(true);
    try { await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }); } catch {}
    try { localStorage.removeItem('authed'); } catch {}
    setAuthed(false);
    setLoggingOut(false);
    if (pathname !== '/') window.location.replace('/');
  }

  const showLogout = authed === true;
  const showLogin = authed !== true; // show whenever not confidently authed (even while verifying)
  const showSpinner = loggingOut; // only during explicit logout now

  return (
    <div className="flex items-center gap-5">
      <ThemeToggle />
      {pathname === '/login' ? null : (
        <div className="relative h-9 w-[120px]">
          {/* Spinner state (initial unknown or during logout) */}
          {showSpinner && (
            <button disabled aria-busy="true" className="absolute inset-0 inline-flex items-center justify-center gap-2 h-9 w-full px-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 shadow-sm text-neutral-500 dark:text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Loading</span>
            </button>
          )}
          {/* Login Button */}
          {showLogin && (
            <div className={(showLogin ? 'opacity-100' : 'opacity-0') + ' absolute inset-0 transition-opacity duration-150'} aria-hidden={showLogin ? 'false':'true'}>
              <button onClick={()=>router.push('/login')} className="inline-flex items-center justify-center gap-1 h-9 w-full px-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Login</button>
            </div>
          )}
          {/* Logout Button (only mount when shown to prevent overlay blocking) */}
          {showLogout && (
            <div className="absolute inset-0 transition-opacity duration-150 opacity-100" aria-hidden="false">
              <button onClick={logout} disabled={loggingOut} className="inline-flex items-center justify-center gap-1 h-9 w-full px-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-80">
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span className="hidden sm:inline">{loggingOut ? 'Logging out' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
