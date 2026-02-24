export type PosStatus = 'pending' | 'configured' | 'deployed';

export interface PosMachine {
  id: number;
  serial: string;
  merchant: string;
  merchantId: string;
  model: string;
  requestDate: string;
  status: PosStatus;
  mid: string | null;
  tid: string | null;
  account: string | null;
  network: string | null;
  currency: string | null;
  configuredOn: string | null;
}

export interface PosStats {
  total: number;
  pending: number;
  configured: number;
  deployed: number;
}

export interface ConfigurePayload {
  mid: string;
  tid: string;
  account: string;
  network: string;
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}
