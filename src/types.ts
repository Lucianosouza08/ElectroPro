export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Material {
  id: number;
  name: string;
  unit: string;
  price: number;
}

export interface QuoteItem {
  id?: number;
  quoteId: number;
  materialId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: number;
  clientId: number;
  date: string;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string;
}

export type CalculationType = 
  | 'ohms_law' 
  | 'power' 
  | 'voltage_drop' 
  | 'cable_sizing' 
  | 'power_factor_correction';

export interface CalculationResult {
  label: string;
  value: string | number;
  unit: string;
}
