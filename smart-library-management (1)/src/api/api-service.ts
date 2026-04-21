/**
 * API Service — wired to the actual Django backend.
 * Base: http://localhost:5000/api
 */

const API_BASE = 'http://localhost:5000/api';

const get = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const json = await res.json();
  return (json.results !== undefined ? json.results : json) as T;
};

const post = async <T>(url: string, body?: object): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanSession {
  id: number;
  device: number;
  device_name: string;
  shelf: number;
  shelf_code: string;
  started_at: string;
  ended_at: string | null;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  total_tags_scanned: number;
  total_expected: number;
}

export interface MissingReport {
  id: number;
  session: number;
  book_copy: number;
  book_title: string;
  rfid_tag: string;
  expected_slot: number;
  shelf_code: string;
  resolved_at: string | null;
  notes: string;
  created_at: string;
}

export interface BookCopy {
  id: number;
  book: number;
  book_title: string;
  book_isbn: string;
  rfid_tag: string;
  barcode: string;
  accession_number: string;
  status: string;
  condition: string;
  assigned_shelf_code: string | null;
  last_scanned_at: string | null;
  is_misplaced: boolean;
}

export interface Shelf {
  id: number;
  code: string;
  section: number;
  section_name: string;
  row_number: number;
  column_number: number;
  capacity: number;
  label: string;
  current_book_count: number;
}

export interface ScannerDevice {
  id: number;
  device_id: string;
  name: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const api = {
  // Scanner
  getSessions:      ()           => get<ScanSession[]>(`${API_BASE}/scanner/sessions/`),
  getSession:       (id: number) => get<ScanSession>(`${API_BASE}/scanner/sessions/${id}/`),
  getMissingReports:()           => get<MissingReport[]>(`${API_BASE}/scanner/missing-reports/`),
  getDevices:       ()           => get<ScannerDevice[]>(`${API_BASE}/scanner/devices/`),
  startSession:     (deviceId: number, shelfId: number) => 
    post<ScanSession>(`${API_BASE}/scanner/sessions/start/`, { device_id: deviceId, shelf_id: shelfId }),
  endSession:       (id: number) => post(`${API_BASE}/scanner/sessions/${id}/end/`),
  resolveMissing:   (id: number, notes: string) =>
    post(`${API_BASE}/scanner/missing-reports/${id}/resolve/`, { notes }),

  // Inventory
  getShelves:       ()           => get<Shelf[]>(`${API_BASE}/inventory/shelves/`),
  getCopies:        ()           => get<BookCopy[]>(`${API_BASE}/inventory/copies/`),
  getShelfCopies:   (id: number) => get<BookCopy[]>(`${API_BASE}/inventory/shelves/${id}/copies/`),
};
