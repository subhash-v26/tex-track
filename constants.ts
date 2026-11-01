
import { Product, Employee, ProductionEntry, DispatchEntry, Transaction, User, UserRole } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@texflow.com',
  role: UserRole.ADMIN,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Cotton Bed Sheet (Queen Size)', 
    category: 'Bedding', 
    price_per_piece: 18.0, 
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p2', 
    name: 'Silk Finish Pillowcase Pair', 
    category: 'Bedding', 
    price_per_piece: 8.5, 
    image_url: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ef21?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p3', 
    name: 'Premium Denim Trouser (14oz)', 
    category: 'Apparel', 
    price_per_piece: 32.0, 
    image_url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p4', 
    name: 'Organic Cotton Polo T-Shirt', 
    category: 'Apparel', 
    price_per_piece: 14.0, 
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p5', 
    name: 'Thermal Blackout Curtain Panel', 
    category: 'Furnishing', 
    price_per_piece: 24.0, 
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?auto=format&fit=crop&q=80&w=400' 
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Rajesh Kumar', phone: '+91 98765 43210', role: 'Stitching', joined_date: '2023-01-15' },
  { id: 'e2', name: 'Sunita Devi', phone: '+91 98765 43211', role: 'Cutting', joined_date: '2023-02-20' },
  { id: 'e3', name: 'Vikram Singh', phone: '+91 98765 43212', role: 'Packing', joined_date: '2023-03-10' },
  { id: 'e4', name: 'Ananya Sharma', phone: '+91 98765 43213', role: 'Stitching', joined_date: '2022-11-05' },
  { id: 'e5', name: 'Mohammed Arif', phone: '+91 98765 43214', role: 'Helper', joined_date: '2023-05-12' },
];

export const generateRecentProductionLogs = (): ProductionEntry[] => {
  const logs: ProductionEntry[] = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    
    const entriesPerDay = dayOffset === 0 ? 3 : dayOffset < 7 ? 4 : 2;
    for (let j = 0; j < entriesPerDay; j++) {
      const pIdx = (dayOffset + j) % INITIAL_PRODUCTS.length;
      const eIdx = (j * 2 + dayOffset) % INITIAL_EMPLOYEES.length;
      const qty = 35 + ((dayOffset * 7 + j * 13) % 45);

      logs.push({
        id: `prod-log-${dayOffset}-${j}`,
        date: dateStr,
        product_id: INITIAL_PRODUCTS[pIdx].id,
        employee_id: INITIAL_EMPLOYEES[eIdx].id,
        quantity: qty,
        notes: j % 2 === 0 ? `Batch #${100 + dayOffset} shift A` : 'Standard quality check passed',
        timestamp: d.getTime() - j * 3600000,
      });
    }
  }
  return logs;
};

export const INITIAL_PRODUCTION_LOGS: ProductionEntry[] = generateRecentProductionLogs();

export const INITIAL_DISPATCH_LOGS: DispatchEntry[] = [
  { 
    id: 'disp-1', 
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], 
    product_id: 'p1', 
    quantity: 120, 
    customer_name: 'FabIndia Lifestyle Ltd', 
    notes: 'Order #FI-902, Gate Pass #GP-441', 
    timestamp: Date.now() - 4 * 86400000 
  },
  { 
    id: 'disp-2', 
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], 
    product_id: 'p3', 
    quantity: 90, 
    customer_name: 'Raymond Retail Outlets', 
    notes: 'Store replenishment shipment DC-104', 
    timestamp: Date.now() - 3 * 86400000 
  },
  { 
    id: 'disp-3', 
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], 
    product_id: 'p4', 
    quantity: 150, 
    customer_name: 'Reliance Trends Distribution Hub', 
    notes: 'Bulk seasonal dispatch', 
    timestamp: Date.now() - 1 * 86400000 
  },
  { 
    id: 'disp-4', 
    date: new Date().toISOString().split('T')[0], 
    product_id: 'p2', 
    quantity: 80, 
    customer_name: 'HomeCenter Furnishings', 
    notes: 'Express courier shipment', 
    timestamp: Date.now() 
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME', category: 'Sales', amount: 84000, date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0], description: 'FabIndia Order #FI-902 50% Advance' },
  { id: 't2', type: 'EXPENSE', category: 'Raw Material', amount: 32000, date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], description: 'Cotton Combed Yarn 40s Count (500kg)' },
  { id: 't3', type: 'EXPENSE', category: 'Utilities', amount: 6800, date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], description: 'State Electricity Board Monthly Power Tariff' },
  { id: 't4', type: 'INCOME', category: 'Sales', amount: 56000, date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], description: 'Raymond Retail Delivery Settlement' },
  { id: 't5', type: 'EXPENSE', category: 'Wages', amount: 18500, date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], description: 'Bi-weekly Stitching & Cutting Piece Rate Payout' },
  { id: 't6', type: 'EXPENSE', category: 'Machinery', amount: 4200, date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], description: 'Overlock Sewing Machine Servicing & Oil Replenishment' },
  { id: 't7', type: 'INCOME', category: 'Scrap Sales', amount: 3500, date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], description: 'Fabric Trimmings & Waste Scrap Disposal' },
];
