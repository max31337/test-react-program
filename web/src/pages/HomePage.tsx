import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Button, Card, CardHeader, CardContent } from '../components/ui';
import { fetchGeo } from '../lib/api';
import { GeoInfo, SearchHistoryItem } from '../types';
import { useAuth } from '../state/auth';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, RefreshCw, Trash2, LogOut, Globe2, Clock, XCircle } from 'lucide-react';

const validateIp = (v: string) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(v) || /^[a-fA-F0-9:]+$/.test(v);

function parseLoc (loc?: string) {
  if (!loc) return null;
  const [lat, lng] = loc.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [inputIp, setInputIp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('history') || '[]'); } catch { return []; }
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedCoords = useMemo(() => parseLoc(geo?.loc), [geo]);
  const hasSelection = selectedIds.size > 0;
  // Track a target center for animated map fly/zoom
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(null);

  useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);

  const loadSelf = useCallback(async () => {
    setError(null);
    try {
      const g = await fetchGeo();
      setGeo(g);
      const loc = parseLoc(g.loc);
      if (loc) setMapTarget([loc.lat, loc.lng]);
    } catch (e) {
      setError('Failed to load geo info');
    }
  }, []);

  useEffect(() => { loadSelf(); }, [loadSelf]);

  async function handleSearch (e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateIp(inputIp)) { setError('Invalid IP address'); return; }
    try {
      const g = await fetchGeo(inputIp);
      setGeo(g);
      const loc = parseLoc(g.loc);
      if (loc) setMapTarget([loc.lat, loc.lng]);
      const item: SearchHistoryItem = { id: crypto.randomUUID(), ip: g.ip, timestamp: new Date().toISOString() };
      setHistory(h => [item, ...h].slice(0, 50));
      setInputIp('');
    } catch (e) {
      setError('Lookup failed');
    }
  }

  function handleClear () {
    loadSelf();
  }

  function toggleSelect (id: string) {
    setSelectedIds(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function deleteSelected () {
    if (selectedIds.size === 0) return;
    setHistory(h => h.filter(i => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
  }

  function showFromHistory (item: SearchHistoryItem) {
    fetchGeo(item.ip).then(g => {
      setGeo(g);
      const loc = parseLoc(g.loc);
      if (loc) setMapTarget([loc.lat, loc.lng]);
    }).catch(() => setError('Lookup failed'));
  }

  const markerIcon = useMemo(() => new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] }), []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.30),transparent_55%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="relative z-10 px-4 pt-6 pb-10 max-w-7xl mx-auto flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">IP Geo Dashboard</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Globe2 className="h-3 w-3" /> Real‑time IP intelligence & mapping</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-slate-700">{user?.email}</span>
              <span className="text-[10px] text-slate-400">Logged in</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-semibold select-none shadow">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <Button variant="secondary" size="sm" onClick={logout} className="gap-1"><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span></Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* Left: Lookup / Info */}
          <Card className="lg:col-span-2 border-slate-200/60 bg-white/75 backdrop-blur shadow-sm shadow-slate-900/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2"><Search className="h-5 w-5 text-blue-600" /> Lookup</h2>
                <Button type="button" variant="outline" size="sm" onClick={handleClear} className="gap-1"><RefreshCw className="h-4 w-4" /> Self</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <Input
                    placeholder="Enter IPv4 or IPv6 address"
                    value={inputIp}
                    onChange={e => setInputIp(e.target.value.trim())}
                    className="pl-4"
                    aria-label="IP address"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={!inputIp}><Search className="h-4 w-4" /> Search</Button>
                  <Button type="button" variant="secondary" onClick={handleClear} className="gap-1"><RefreshCw className="h-4 w-4" /> Clear</Button>
                </div>
              </form>
              {error && (
                <div className="flex items-start gap-2 text-red-600 text-xs rounded-md border border-red-200 bg-red-50 px-3 py-2" role="alert">
                  <XCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {geo ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wide">Current IP Info</h3>
                      <div className="rounded-md border bg-white/60 backdrop-blur px-4 py-3 text-sm grid gap-1">
                        <div className="flex justify-between"><span className="text-slate-500">IP</span><span className="font-mono font-medium">{geo.ip}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">City</span><span>{geo.city || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Region</span><span>{geo.region || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Country</span><span>{geo.country || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Org</span><span className="truncate max-w-[140px]" title={geo.org}>{geo.org || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Timezone</span><span>{geo.timezone || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Loc</span><span>{geo.loc || '—'}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                      {geo.country && <span className="px-2 py-1 rounded bg-blue-600/10 text-blue-700 border border-blue-200">{geo.country}</span>}
                      {geo.city && <span className="px-2 py-1 rounded bg-indigo-600/10 text-indigo-700 border border-indigo-200">{geo.city}</span>}
                      {geo.region && <span className="px-2 py-1 rounded bg-fuchsia-600/10 text-fuchsia-700 border border-fuchsia-200">{geo.region}</span>}
                      {geo.org && <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 border border-amber-200">{geo.org.split(' ')[0]}</span>}
                    </div>
                  </div>
                  <div className="h-72 rounded-lg overflow-hidden ring-1 ring-slate-200/70 bg-white/60 backdrop-blur relative">
                    {selectedCoords ? (
                      <MapContainer center={[selectedCoords.lat, selectedCoords.lng]} zoom={3} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                        {mapTarget && <FlyTo center={mapTarget} zoom={11} />}
                        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={markerIcon}>
                          <Popup><span className="font-semibold">{geo.ip}</span><br />{geo.city || ''} {geo.region || ''}</Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                        <MapPin className="h-6 w-6" />
                        <span>No coordinates</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Loading current IP data...</div>
              )}
            </CardContent>
          </Card>

          {/* Right: History */}
          <Card className="border-slate-200/60 bg-white/75 backdrop-blur shadow-sm shadow-slate-900/5 flex flex-col max-h-[82vh]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-600" /> History</h2>
                <div className="flex items-center gap-2">
                  {hasSelection && (
                    <span className="text-[10px] px-2 py-1 rounded bg-indigo-600/10 text-indigo-700 border border-indigo-200 font-medium">
                      {selectedIds.size} selected
                    </span>
                  )}
                  <Button type="button" variant="destructive" size="sm" disabled={!hasSelection} onClick={deleteSelected} className="gap-1">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden xl:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto divide-y rounded-md border border-slate-200/60 bg-white/50 backdrop-blur scroll-smooth">
                {history.length === 0 && (
                  <div className="py-10 text-center text-xs text-slate-500">No history yet. Perform a search.</div>
                )}
                {history.map(item => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => showFromHistory(item)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showFromHistory(item); } }}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition cursor-pointer"
                    aria-label={`Show details for ${item.ip}`}
                  >
                    <input
                      type="checkbox"
                      onClick={e => { e.stopPropagation(); }}
                      onChange={e => { e.stopPropagation(); toggleSelect(item.id); }}
                      checked={selectedIds.has(item.id)}
                      className="accent-blue-600 cursor-pointer"
                      aria-label={`Select ${item.ip}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium truncate" title={item.ip}>{item.ip}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component to animate map view changes
const FlyTo: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 11 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
};
