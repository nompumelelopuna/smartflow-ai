export type Status = 'pending' | 'shipped' | 'delivered' | 'cancelled';
export type ReportKey = 'not-placed' | 'no-tracking' | 'no-business-unit' | 'over-eta' | 'no-pod';

export interface User { id: number; email: string; name: string; role: 'admin' | 'user' }
export interface Order {
  id: number; order_number: string; supplier_id: number; supplier_name: string;
  description: string; quantity: number; unit_price: number; order_date: string;
  expected_delivery: string | null; actual_delivery: string | null; status: Status;
  tracking_number: string | null; notes: string | null;
  business_unit: string | null; placed_at: string | null; pod_received: number;
}
export interface Supplier {
  id: number; name: string; contact_email: string | null; phone: string | null;
  address: string | null; order_count?: number;
}
export interface Summary {
  total: number; byStatus: Record<Status, number>; counts: Record<ReportKey, number>;
  openValue: number; onTimeRate: number | null;
  bySupplier: { name: string; orders: number; value: number }[];
}
export interface ReportResult { key: ReportKey; title: string; description: string; count: number; rows: Order[] }

export const REPORT_META: { key: ReportKey; title: string }[] = [
  { key: 'not-placed', title: 'Not Placed' }, { key: 'no-tracking', title: 'No Tracking' },
  { key: 'no-business-unit', title: 'No Business Unit' }, { key: 'over-eta', title: 'Over ETA' },
  { key: 'no-pod', title: 'No POD' },
];
