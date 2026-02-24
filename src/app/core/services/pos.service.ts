import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PosMachine, PosStats, ConfigurePayload, PosStatus } from '../models/pos-machine.model';

// ─── MOCK DATA — replace Observable bodies with HttpClient calls ──────────
const MOCK_DATA: PosMachine[] = [
  { id: 1, serial: 'POS-TZ-001842', merchant: 'OK Zimbabwe',    merchantId: 'MRC-44201', model: 'Ingenico Move 5000',   requestDate: '2025-01-08', status: 'deployed',   mid: 'MID-440021', tid: 'TID-840022', account: '1234 5678 9012 0001', network: 'All Networks',     currency: 'Multi-currency', configuredOn: '2025-01-09' },
  { id: 2, serial: 'POS-TZ-001843', merchant: 'TM Pick n Pay',  merchantId: 'MRC-10042', model: 'PAX A920',             requestDate: '2025-01-10', status: 'deployed',   mid: 'MID-100422', tid: 'TID-100431', account: '2345 6789 0123 4502', network: 'Visa / Mastercard', currency: 'USD',            configuredOn: '2025-01-11' },
  { id: 3, serial: 'POS-TZ-001844', merchant: 'Simbisa Brands', merchantId: 'MRC-55021', model: 'Verifone V200c',       requestDate: '2025-01-12', status: 'configured', mid: 'MID-550421', tid: 'TID-550231', account: '3456 7890 1234 5003', network: 'ZimSwitch',         currency: 'ZIG',            configuredOn: '2025-01-13' },
  { id: 4, serial: 'POS-TZ-001845', merchant: 'Edgars Zimbabwe',merchantId: 'MRC-30088', model: 'Ingenico Desk 3500',   requestDate: '2025-01-15', status: 'pending',    mid: null, tid: null, account: null, network: null, currency: null, configuredOn: null },
  { id: 5, serial: 'POS-TZ-001846', merchant: 'Chicken Inn',    merchantId: 'MRC-22011', model: 'PAX A77',             requestDate: '2025-01-16', status: 'pending',    mid: null, tid: null, account: null, network: null, currency: null, configuredOn: null },
  { id: 6, serial: 'POS-TZ-001847', merchant: 'Zimnat Insurance',merchantId: 'MRC-71033',model: 'Verifone V400m',       requestDate: '2025-01-17', status: 'pending',    mid: null, tid: null, account: null, network: null, currency: null, configuredOn: null },
  { id: 7, serial: 'POS-TZ-001848', merchant: 'Innscor Africa', merchantId: 'MRC-84002', model: 'PAX A920 Pro',         requestDate: '2025-01-18', status: 'configured', mid: 'MID-840022', tid: 'TID-840011', account: '4567 8901 2345 6007', network: 'All Networks',     currency: 'Multi-currency', configuredOn: '2025-01-19' },
  { id: 8, serial: 'POS-TZ-001849', merchant: 'Game Stores',    merchantId: 'MRC-93004', model: 'Ingenico Move 5000',   requestDate: '2025-01-20', status: 'deployed',   mid: 'MID-930041', tid: 'TID-930018', account: '5678 9012 3456 7008', network: 'Visa / Mastercard', currency: 'USD',            configuredOn: '2025-01-21' },
];

@Injectable({ providedIn: 'root' })
export class PosService {
  // ── Reactive state ────────────────────────────────────────────────────────
  private _machines = signal<PosMachine[]>([...MOCK_DATA]);

  machines = this._machines.asReadonly();

  stats = computed<PosStats>(() => {
    const all = this._machines();
    return {
      total:      all.length,
      pending:    all.filter(m => m.status === 'pending').length,
      configured: all.filter(m => m.status === 'configured').length,
      deployed:   all.filter(m => m.status === 'deployed').length,
    };
  });

  // ── API methods (swap mock with HttpClient) ───────────────────────────────

  /** GET /api/pos — fetch all machines */
  fetchAll(): Observable<PosMachine[]> {
    // Real: return this.http.get<PosMachine[]>(`${environment.apiUrl}/pos`);
    return of([...MOCK_DATA]).pipe(delay(300));
  }

  /** GET /api/pos?status=pending — fetch by status */
  fetchByStatus(status: PosStatus): Observable<PosMachine[]> {
    // Real: return this.http.get<PosMachine[]>(`${environment.apiUrl}/pos`, { params: { status } });
    return of(MOCK_DATA.filter(m => m.status === status)).pipe(delay(200));
  }

  /** GET /api/pos/:id — find by id */
  findById(id: number): PosMachine | undefined {
    return this._machines().find(m => m.id === id);
  }

  /** GET /api/pos?serial=XXX — search by serial */
  searchBySerial(serial: string): Observable<PosMachine[]> {
    const q = serial.toLowerCase();
    return of(this._machines().filter(m => m.serial.toLowerCase().includes(q))).pipe(delay(150));
  }

  /** PUT /api/pos/:id/configure — configure a machine */
  configure(id: number, payload: ConfigurePayload): Observable<PosMachine> {
    // Real: return this.http.put<PosMachine>(`${environment.apiUrl}/pos/${id}/configure`, payload);
    const updated = this._machines().map(m =>
      m.id === id
        ? { ...m, ...payload, status: 'configured' as PosStatus, configuredOn: new Date().toISOString().slice(0, 10) }
        : m
    );
    this._machines.set(updated);
    const result = updated.find(m => m.id === id)!;
    return of(result).pipe(delay(400));
  }

  /** PUT /api/pos/:id/deploy — mark as deployed */
  deploy(id: number): Observable<PosMachine> {
    // Real: return this.http.put<PosMachine>(`${environment.apiUrl}/pos/${id}/deploy`, {});
    const updated = this._machines().map(m =>
      m.id === id ? { ...m, status: 'deployed' as PosStatus } : m
    );
    this._machines.set(updated);
    const result = updated.find(m => m.id === id)!;
    return of(result).pipe(delay(400));
  }
}
