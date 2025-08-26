export interface User { id: string; email: string; name: string; }
export interface GeoInfo { ip: string; city?: string; region?: string; country?: string; loc?: string; org?: string; timezone?: string; postal?: string; [k: string]: any }
export interface SearchHistoryItem { id: string; ip: string; timestamp: string; }
