
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  warehouse_id: string;
  productName?: string;
  price?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  date: string;
  status: 'preparacion' | 'enviado' | 'entregado' | 'cancelado';
  address: string;
  total: number;
  customer_id: string;
  shipping_address: string;
  total_amount: number;
  payment_status: 'pendiente' | 'pagado' | 'cancelado';
  items: OrderItem[];
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  notes?: string;
  warehouseSource?: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  status: 'pendiente' | 'pagada' | 'cancelada';
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  items: OrderItem[];
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  address: string;
  status: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  assignedAt?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string;
}
