import { db } from './db';

const day = (offset: number | null) => {
  if (offset === null) return null;
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const suppliers = [
  ['Highveld Components (Pty) Ltd', 'orders@highveld.example', '011 555 0101'],
  ['Cape Packaging Co', 'sales@capepack.example', '021 555 0102'],
  ['Karoo Logistics', 'dispatch@karoo.example', '023 555 0103'],
  ['Jozi Office Supplies', 'hello@jozioffice.example', '010 555 0104'],
  ['Durban Industrial Supply', 'accounts@durbanind.example', '031 555 0105'],
];

// supplier#, description, qty, price ZAR, ordered, ETA, actual, status, tracking, business unit, placed, POD, notes
const orders: any[][] = [
  [1, 'Control boards (batch A)', 200, 290, -30, -20, -21, 'delivered', 'HC-88421', 'Manufacturing', -30, 1, null],
  [1, 'Power connectors', 1000, 17, -12, -4, null, 'shipped', 'HC-88990', 'Manufacturing', -12, 0, 'Port delay reported'],
  [2, 'Retail boxes, medium', 500, 24, -25, -10, -9, 'delivered', 'CP-2201', 'Retail', -25, 0, 'POD outstanding'],
  [2, 'Bubble wrap rolls', 60, 440, -8, -2, null, 'pending', null, 'Retail', null, 0, null],
  [2, 'Branded tape', 120, 68, -3, 5, null, 'pending', null, null, null, 0, null],
  [3, 'Pallet transport, Gauteng route', 4, 6200, -6, 1, null, 'shipped', null, 'Logistics', -6, 0, 'Tracking not yet received'],
  [3, 'Cold-chain container hire', 1, 25000, -14, -6, null, 'shipped', 'KL-5530', 'Logistics', -14, 0, null],
  [4, 'A4 paper cartons', 40, 378, -9, 2, null, 'shipped', 'JO-7712', null, -9, 0, null],
  [4, 'Ergonomic keyboards', 15, 0, -2, null, null, 'pending', null, 'Head Office', null, 0, 'Awaiting final quote'],
  [5, 'Hydraulic fittings', 80, 195, -18, -7, null, 'pending', null, 'Manufacturing', -18, 0, 'Supplier not responding'],
  [5, 'Safety gloves', 300, 42, -20, -12, -12, 'delivered', 'DI-9901', 'Manufacturing', -20, 1, null],
  [5, 'Pressure gauges', 25, 820, -1, 12, null, 'pending', null, 'Manufacturing', null, 0, null],
  [1, 'Sensor modules', 150, 126, -5, 3, null, 'shipped', 'HC-89120', null, -5, 0, null],
  [4, 'Whiteboards', 6, 950, -15, -9, -8, 'delivered', 'JO-7001', 'Head Office', -15, 0, null],
];

export function seedIfEmpty() {
  if ((db.prepare('SELECT COUNT(*) AS c FROM suppliers').get() as { c: number }).c > 0) return;
  const addS = db.prepare('INSERT INTO suppliers (name, contact_email, phone) VALUES (?, ?, ?)');
  const addO = db.prepare(`INSERT INTO orders (order_number, supplier_id, description, quantity, unit_price,
    order_date, expected_delivery, actual_delivery, status, tracking_number, business_unit, placed_at,
    pod_received, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction(() => {
    // Use the real inserted ids (AUTOINCREMENT ids are not 1..n if suppliers were ever deleted).
    const ids = suppliers.map(s => Number(addS.run(...s).lastInsertRowid));
    orders.forEach((o, i) => addO.run(`PO-${1001 + i}`, ids[o[0] - 1], o[1], o[2], o[3], day(o[4]), day(o[5]),
      day(o[6]), o[7], o[8], o[9], day(o[10]), o[11], o[12]));
  })();
  console.log('Seeded fictional sample data (ZAR).');
}
