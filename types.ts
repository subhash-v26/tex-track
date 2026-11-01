
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price_per_piece: number; // Cost used for calculating employee wages in ₹
  image_url?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: 'Stitching' | 'Cutting' | 'Packing' | 'Helper';
  hourly_rate?: number; // Optional if paid by piece
  joined_date: string;
}

export interface ProductionEntry {
  id: string;
  date: string; // ISO String
  product_id: string;
  employee_id: string;
  quantity: number;
  notes?: string;
  timestamp: number;
}

export interface DispatchEntry {
  id: string;
  date: string;
  product_id: string;
  quantity: number;
  customer_name?: string;
  notes?: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  reference_id?: string; // Link to an invoice or receipt ID
}

export interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  totalPieces: number;
  totalHours: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
}

export interface InventoryItem {
  product_id: string;
  name: string;
  category: string;
  total_produced: number;
  total_dispatched: number;
  current_stock: number;
  image_url?: string;
}
