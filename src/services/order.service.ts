
import { supabase } from '@/integrations/supabase/client';
import { Order, Invoice, Delivery, OrderItem } from '@/types/order-types';
import { User } from '@/types/auth-types';

// Dummy data for now - this would be replaced with actual API calls
const dummyOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: { id: "user1", name: "Juan Pérez", email: "juan@example.com", role: "cliente" },
    customerId: "user1",
    date: "2023-05-15",
    status: "preparacion",
    address: "Calle Principal 123, Ciudad",
    total: 157.50,
    customer_id: "user1",
    shipping_address: "Calle Principal 123, Ciudad",
    total_amount: 157.50,
    payment_status: "pendiente",
    items: [
      { id: "item1", order_id: "1", product_id: "prod1", quantity: 2, unit_price: 45.00, subtotal: 90.00, warehouse_id: "w1", productName: "Producto A", price: 45.00 },
      { id: "item2", order_id: "1", product_id: "prod2", quantity: 1, unit_price: 67.50, subtotal: 67.50, warehouse_id: "w1", productName: "Producto B", price: 67.50 }
    ]
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: { id: "user2", name: "María García", email: "maria@example.com", role: "cliente" },
    customerId: "user2",
    date: "2023-05-16",
    status: "enviado",
    address: "Avenida Secundaria 456, Otra Ciudad",
    total: 230.00,
    deliveryPersonId: 1,
    deliveryPersonName: "Luis Torres",
    customer_id: "user2",
    shipping_address: "Avenida Secundaria 456, Otra Ciudad",
    total_amount: 230.00,
    payment_status: "pagado",
    items: [
      { id: "item3", order_id: "2", product_id: "prod3", quantity: 1, unit_price: 230.00, subtotal: 230.00, warehouse_id: "w1", productName: "Producto C", price: 230.00 }
    ]
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customer: { id: "user3", name: "Carlos Rodríguez", email: "carlos@example.com", role: "cliente" },
    customerId: "user3",
    date: "2023-05-17",
    status: "entregado",
    address: "Plaza Central 789, Otra Ciudad",
    total: 89.99,
    deliveryPersonId: 2,
    deliveryPersonName: "Ana García",
    customer_id: "user3",
    shipping_address: "Plaza Central 789, Otra Ciudad",
    total_amount: 89.99,
    payment_status: "pagado",
    items: [
      { id: "item4", order_id: "3", product_id: "prod4", quantity: 1, unit_price: 89.99, subtotal: 89.99, warehouse_id: "w2", productName: "Producto D", price: 89.99 }
    ]
  }
];

// Dummy invoices
const dummyInvoices: Invoice[] = [
  {
    id: "1",
    order_id: "1",
    invoice_number: "INV-001",
    issue_date: "2023-05-15",
    due_date: "2023-06-15",
    total_amount: 157.50,
    tax_amount: 25.00,
    status: "pendiente",
    orderNumber: "ORD-001",
    customerName: "Juan Pérez",
    customerAddress: "Calle Principal 123, Ciudad",
    date: "2023-05-15",
    subtotal: 132.50,
    tax: 25.00,
    total: 157.50,
    items: [
      { id: "item1", order_id: "1", product_id: "prod1", quantity: 2, unit_price: 45.00, subtotal: 90.00, warehouse_id: "w1", productName: "Producto A", price: 45.00 },
      { id: "item2", order_id: "1", product_id: "prod2", quantity: 1, unit_price: 67.50, subtotal: 67.50, warehouse_id: "w1", productName: "Producto B", price: 67.50 }
    ]
  },
  {
    id: "2",
    order_id: "2",
    invoice_number: "INV-002",
    issue_date: "2023-05-16",
    due_date: "2023-06-16",
    total_amount: 230.00,
    tax_amount: 36.70,
    status: "pagada",
    orderNumber: "ORD-002",
    customerName: "María García",
    customerAddress: "Avenida Secundaria 456, Otra Ciudad",
    date: "2023-05-16",
    subtotal: 193.30,
    tax: 36.70,
    total: 230.00,
    items: [
      { id: "item3", order_id: "2", product_id: "prod3", quantity: 1, unit_price: 230.00, subtotal: 230.00, warehouse_id: "w1", productName: "Producto C", price: 230.00 }
    ]
  }
];

export const getAllOrders = async (): Promise<Order[]> => {
  // This would be replaced with an actual API call to Supabase
  return dummyOrders;
};

export const getOrders = (): Order[] => {
  // This would be replaced with an actual API call to Supabase
  return dummyOrders;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  // This would be replaced with an actual API call
  const order = dummyOrders.find(o => o.id === id);
  return order || null;
};

export const updateOrderStatus = async (
  orderId: string, 
  status: string,
  deliveryPersonId?: number,
  deliveryPersonName?: string
): Promise<any> => {
  // This would be replaced with an actual API call
  const orderIndex = dummyOrders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    throw new Error("Order not found");
  }
  
  const updatedOrder = {
    ...dummyOrders[orderIndex],
    status: status as Order['status'],
  };
  
  if (deliveryPersonId) {
    updatedOrder.deliveryPersonId = deliveryPersonId;
  }
  
  if (deliveryPersonName) {
    updatedOrder.deliveryPersonName = deliveryPersonName;
  }
  
  dummyOrders[orderIndex] = updatedOrder;
  return updatedOrder;
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  // This would be replaced with an actual API call
  return dummyInvoices;
};

export const getInvoices = (): Invoice[] => {
  // This would be replaced with an actual API call
  return dummyInvoices;
};

export const payInvoice = (invoiceId: number): Invoice => {
  // This would be replaced with an actual API call
  const invoice = dummyInvoices.find(i => i.id === invoiceId.toString());
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  
  invoice.status = "pagada";
  return invoice;
};

export const getAllDeliveries = async (): Promise<Delivery[]> => {
  // This would be replaced with an actual API call
  return [];
};

export const getDeliveries = (): Delivery[] => {
  // This would be replaced with an actual API call
  return [];
};

export const getCustomers = async (): Promise<User[]> => {
  // This would be replaced with an actual API call
  return [
    { id: "user1", name: "Juan Pérez", email: "juan@example.com", role: "cliente" },
    { id: "user2", name: "María García", email: "maria@example.com", role: "cliente" },
    { id: "user3", name: "Carlos Rodríguez", email: "carlos@example.com", role: "cliente" }
  ];
};

// Define Customer type for better compatibility
export type Customer = User;

// Export types from order-types
export type { Order, OrderItem, Invoice, Delivery } from '@/types/order-types';
