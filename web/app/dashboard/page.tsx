'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Search, MapPin, RefreshCw, Trash2, Globe2, ListChecks, AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../../components/ui/modal';
const Map = dynamic(() => import('../../components/Map').then(m => m.MapView), { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">Loading map…</div> });

interface GeoData { lat?: number; lon?: number; country?: string; city?: string; isp?: string; query?: string; }

function normalizeGeo(raw: any, fallbackIp?: string): GeoData {
  if (!raw) return {};
  // ip-api format already has needed fields (query, country, city, isp, lat, lon)
  let lat: number | undefined = raw.lat;
  let lon: number | undefined = raw.lon;
  // ipinfo format has loc: "lat,lon" and ip, org
  if ((lat === undefined || lon === undefined) && typeof raw.loc === 'string') {
    const parts = raw.loc.split(',');
    if (parts.length === 2) {
      const la = Number(parts[0]);
      const lo = Number(parts[1]);
      if (!Number.isNaN(la) && !Number.isNaN(lo)) { lat = la; lon = lo; }
    }
  }
  const isp = raw.isp || raw.org; // ipinfo uses org
  const query = raw.query || raw.ip || fallbackIp;
  const city = raw.city || raw.region; // ipinfo sometimes has city & region
  return { lat, lon, country: raw.country, city, isp, query };
}

export default function DashboardPage() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [guest, setGuest] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

  // Logout now handled globally in navbar

  async function checkAuth(): Promise<boolean> {
    try {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.status === 401) {
        // Not authed: show guest modal instead of redirect
        setGuest(true);
        setShowGuestModal(true);
        return false;
      }
      return true;
    } catch {
      setGuest(true);
      setShowGuestModal(true);
      return false;
    } finally {
      setAuthChecked(true);
    }
  }

  function isValidIp(v: string) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(v);
  }

  async function searchIp(targetIp?: string) {
    const search = targetIp || ip;
    if (!search) return;
  if (!isValidIp(search)) { setError('Invalid IPv4 address'); setShowErrorModal(true); return; }
    setLoading(true); setError(null);
    try {
  const res = await fetch(`${API_BASE}/geo/lookup?ip=${search}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      setGeo(normalizeGeo(data.data, data.ip));
      loadHistory();
    } catch (e:any) {
      setError(e.message || 'Lookup failed');
    } finally { setLoading(false); }
  }

  async function loadSelf() {
    setLoading(true); setError(null);
    try {
  const res = await fetch(`${API_BASE}/geo/lookup`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGeo(normalizeGeo(data.data, data.ip));
      }
    } finally { setLoading(false); }
  }

  async function loadHistory() {
  const res = await fetch(`${API_BASE}/history`, { credentials: 'include' });
    const data = await res.json();
    setHistory(data.items);
  }

  async function deleteSelected() {
  await fetch(`${API_BASE}/history`, { method: 'DELETE', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ids: Array.from(selected) }) });
    setSelected(new Set());
    loadHistory();
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function selectAll() {
    if (selected.size === history.length) setSelected(new Set());
    else setSelected(new Set(history.map(h => h.id)));
  }

  useEffect(() => {
    (async () => {
      const ok = await checkAuth();
      if (ok) {
        await Promise.all([loadHistory(), loadSelf()]);
      } else {
        // still load self IP for guest experience
        await loadSelf();
      }
    })();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-sm text-neutral-500 animate-pulse">Checking session…</div>
    );
  }

  return (
    <>
  <div className="space-y-5 max-w-7xl mx-auto">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Globe2 className="h-7 w-7 text-blue-600" /> IP Geo Locator</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Search and visualize IP geolocation data</p>
        </div>
    <form onSubmit={(e)=>{ e.preventDefault(); searchIp(); }} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input value={ip} onChange={e=>setIp(e.target.value)} placeholder="Enter IPv4 (e.g. 8.8.8.8)" />
          <div className="flex gap-2">
            <Button type="submit" disabled={!ip || loading} className="gap-1"><Search className="h-4 w-4" /> {loading? 'Searching…':'Search'}</Button>
            <Button type="button" variant="secondary" onClick={()=>{ setIp(''); loadSelf(); }} className="gap-1"><RefreshCw className="h-4 w-4" /> Self</Button>
            {selected.size>0 && (
              <Button
                type="button"
                variant="destructiveOutline"
                onClick={deleteSelected}
                className="gap-1 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete ({selected.size})</span>
              </Button>
            )}
          </div>
        </form>
      </header>
  {error && !showErrorModal && <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded" role="alert">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-12">
        {/* Left column: result + history */}
        <div className="space-y-5 xl:col-span-5 2xl:col-span-4 order-2 xl:order-1">
          <Card className="flex flex-col">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-blue-600" /> Result</CardTitle></CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6">
              {geo ? (
                <div className="space-y-4">
                  <div className="grid gap-1 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-800/70">
                    <Field label="IP" value={geo.query} mono />
                    <Field label="Country" value={geo.country} />
                    <Field label="City" value={geo.city} />
                    <Field label="ISP" value={geo.isp} />
                    <Field label="Coords" value={(geo.lat && geo.lon) ? `${geo.lat}, ${geo.lon}` : undefined} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                    {geo.country && <Tag text={geo.country} color="blue" />}
                    {geo.city && <Tag text={geo.city} color="indigo" />}
                    {geo.isp && <Tag text={(geo.isp||'').split(' ')[0]} color="amber" />}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Loading self IP...</div>
              )}
            </CardContent>
          </Card>
          {!guest && (
          <Card className="flex flex-col h-[360px] md:h-[400px] lg:h-[440px]">
            <CardHeader className="pb-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4 text-indigo-600" /> History</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={selectAll} className="gap-1 text-xs h-8 px-2">
                  <Checkbox checked={selected.size===history.length && history.length>0 && history.length>0} readOnly />
                  <span>Select All</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <div className="h-full overflow-y-auto divide-y border-t border-neutral-200 dark:border-neutral-700 text-sm scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                {history.length === 0 && <div className="p-6 text-center text-xs text-neutral-500">No history yet.</div>}
                {history.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/60">
                    <Checkbox checked={selected.has(item.id)} onChange={()=>toggle(item.id)} />
                    <button className="underline text-blue-600 dark:text-blue-400" onClick={()=>{ setGeo(normalizeGeo(item.data, item.ip)); }}>{item.ip}</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
          {guest && (
            <Card className="border-dashed">
              <CardHeader className="pb-2"><CardTitle className="text-base">Guest Mode</CardTitle></CardHeader>
              <CardContent className="text-xs text-neutral-600 dark:text-neutral-400 space-y-3">
                <p>You are exploring as a guest. Lookups work, but history and bulk actions are disabled.</p>
                <Button size="sm" variant="outline" onClick={()=>{ window.location.href='/login'; }}>Sign In for History</Button>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Right column: large map */}
        <div className="xl:col-span-7 2xl:col-span-8 order-1 xl:order-2">
          <Card className="h-[480px] md:h-[560px] xl:sticky xl:top-4 flex">
            <CardContent className="p-0 flex-1">
              {geo && geo.lat!=null && geo.lon!=null ? (
                <Map lat={geo.lat} lon={geo.lon} />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">No map data</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      <Modal open={showErrorModal} onClose={()=>{ setShowErrorModal(false); }}>
        <ModalHeader>
          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> <ModalTitle>Invalid IP</ModalTitle></div>
        </ModalHeader>
        <ModalBody>
          <p>The value you entered is not a valid IPv4 address.</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
            <li>Use dotted decimal format (e.g. 8.8.8.8)</li>
            <li>Only numbers 0-255 in each octet</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={()=>{ setShowErrorModal(false); setError(null); }}>Close</Button>
        </ModalFooter>
    </Modal>
      <Modal open={showGuestModal} onClose={()=>setShowGuestModal(false)}>
        <ModalHeader>
          <ModalTitle>Continue as Guest?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm mb-3">You&apos;re not signed in. You can:</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-neutral-600 dark:text-neutral-400 mb-3">
            <li>Run IP lookups (no limit in this demo)</li>
            <li>See live map results</li>
            <li><span className="font-medium">But:</span> History & multi-delete are disabled</li>
          </ul>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Sign in to enable persistent history storage.</p>
        </ModalBody>
  <ModalFooter>
          <Button variant="outline" onClick={()=>{ setShowGuestModal(false); }}>Continue as Guest</Button>
          <Button onClick={()=>{ window.location.href='/login'; }}>Sign In</Button>
        </ModalFooter>
      </Modal>
  </>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={"text-right " + (mono ? 'font-mono font-medium' : '')}>{value ?? '—'}</span>
    </div>
  );
}

function Tag({ text, color }: { text: string; color: 'blue' | 'indigo' | 'amber' }) {
  const map: Record<string,string> = {
    blue: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-400/30',
    indigo: 'bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-400/30',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30'
  };
  return <span className={'px-2 py-1 rounded ' + map[color]}>{text}</span>;
}
