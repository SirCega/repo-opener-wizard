
import { User } from './auth-types';

export interface Order {
  id: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  shipping_address: string;
  total_amount: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  customer?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  issue_date?: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  status: string;
  pdf_url?: string;
  order?: Order;
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string;
  status: string;
  assigned_at?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  order?: Order;
  delivery_person?: User;
}
