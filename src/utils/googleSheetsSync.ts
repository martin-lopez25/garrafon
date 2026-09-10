import { AppSettings, DayAssignment, Person } from '../types';

export interface CloudDatabase {
  version: '1.0';
  updatedAt: string;
  people: Person[];
  settings: AppSettings;
  assignments: DayAssignment[];
}

const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL?.trim();

export const isCloudSyncConfigured = Boolean(endpoint);

export async function loadCloudDatabase(): Promise<CloudDatabase | null> {
  if (!endpoint) return null;

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Google Sheets respondió ${response.status}`);

  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || 'No se pudo leer Google Sheets');
  return payload.data || null;
}

export async function saveCloudDatabase(data: CloudDatabase): Promise<void> {
  if (!endpoint) return;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) throw new Error(`Google Sheets respondió ${response.status}`);

  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || 'No se pudo guardar en Google Sheets');
}