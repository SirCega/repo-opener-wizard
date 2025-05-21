
import { User } from "./auth-types";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  warehouse_id: string;
  productName: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string | User;
  customerId: string;
  date: string;
  status: 'pendiente' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado';
  address: string;
  total: number;
  deliveryPersonId?: number;
  deliveryPersonName?: string;
  customer_id: string;
  shipping_address: string;
  total_amount: number;
  payment_status: string;
  items?: OrderItem[];
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  status: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  items?: OrderItem[];
}

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string;
  status: string;
  assigned_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
}

export type Customer = User;
