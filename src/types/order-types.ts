
import { User } from './auth-types';

export interface Order {
  id: string;
  customer_id: string;
  shipping_address: string;
  total_amount: number;
  status: 'pendiente' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado';
  payment_status: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  customer?: User;
  // UI specific fields
  orderNumber?: string;
  date?: string;
  address?: string;
  total?: number;
  deliveryPersonId?: number;
  deliveryPersonName?: string;
  customerId?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  warehouse_id: string;
  product?: {
    name: string;
    sku: string;
  };
  // UI specific fields
  productName?: string;
  price?: number;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  issue_date?: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  status: string;
  pdf_url?: string;
  order?: Order;
  // UI specific fields
  orderNumber?: string;
  customerName?: string;
  customerAddress?: string;
  date?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  items?: OrderItem[];
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
  delivery_person?: {
    id: string;
    name: string;
  };
}
