import React, { useState } from 'react';
import { Input, Button, Card, Label } from '../components/ui';
import { ShieldCheck, Loader2, Mail, Lock } from 'lucide-react';
import { loginRequest } from '../lib/api';
import { useAuth } from '../state/auth';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      setAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.30),transparent_55%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-16">
        <div className="max-w-sm text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/50 backdrop-blur px-4 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Secure Access
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            IP Geo Locator
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Log in to explore IP geolocation details in real time, visualize locations on the map, and manage your recent lookups with a modern history workflow.
          </p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• Secure JWT authentication</li>
            <li>• Fast IP search & validation</li>
            <li>• History & map integration</li>
          </ul>
        </div>
        <Card className="w-full max-w-md border-slate-200/60 bg-white/70 backdrop-blur shadow-xl shadow-slate-900/5">
          <div className="p-6 pb-3 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Welcome back</h2>
            <p className="text-sm text-slate-500">Use the seeded credentials to continue.</p>
          </div>
          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              {error && <div className="text-red-600 text-xs rounded-md border border-red-200 bg-red-50 px-3 py-2" role="alert" aria-live="polite">{error}</div>}
              <Button disabled={loading} className="w-full h-11 font-medium tracking-wide shadow-sm hover:shadow transition-all active:scale-[0.985]" type="submit">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-[10px] text-slate-500 text-center">Seed user: user@example.com / Password123!</p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};
