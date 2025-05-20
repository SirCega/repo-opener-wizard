import { supabase } from '@/integrations/supabase/client';
import { Order, Invoice, Delivery, OrderItem } from '@/types/order-types';
import { User } from '@/types/auth-types';

// Dummy data for now - this would be replaced with actual API calls
const dummyOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customer: "Juan Pérez",
    customerId: "user1",
    date: "2023-05-15",
    status: "preparacion",
    address: "Calle Principal 123, Ciudad",
    total: 157.50,
    items: [
      { id: "item1", order_id: "1", product_id: "prod1", quantity: 2, unit_price: 45.00, subtotal: 90.00, warehouse_id: "w1", productName: "Producto A", price: 45.00 },
      { id: "item2", order_id: "1", product_id: "prod2", quantity: 1, unit_price: 67.50, subtotal: 67.50, warehouse_id: "w1", productName: "Producto B", price: 67.50 }
    ]
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customer: "María García",
    customerId: "user2",
    date: "2023-05-16",
    status: "enviado",
    address: "Avenida Secundaria 456, Otra Ciudad",
    total: 230.00,
    deliveryPersonId: 1,
    deliveryPersonName: "Luis Torres",
    items: [
      { id: "item3", order_id: "2", product_id: "prod3", quantity: 1, unit_price: 230.00, subtotal: 230.00, warehouse_id: "w1", productName: "Producto C", price: 230.00 }
    ]
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customer: "Carlos Rodríguez",
    customerId: "user3",
    date: "2023-05-17",
    status: "entregado",
    address: "Plaza Central 789, Otra Ciudad",
    total: 89.99,
    deliveryPersonId: 2,
    deliveryPersonName: "Ana García",
    items: [
      { id: "item4", order_id: "3", product_id: "prod4", quantity: 1, unit_price: 89.99, subtotal: 89.99, warehouse_id: "w2", productName: "Producto D", price: 89.99 }
    ]
  }
];

export const getAllOrders = async (): Promise<Order[]> => {
  // This would be replaced with an actual API call
  return dummyOrders;
};

export const getOrders = (): Order[] => {
  // This would be replaced with an actual API call
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
): Promise<Order> => {
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
  return [];
};

export const getAllDeliveries = async (): Promise<Delivery[]> => {
  // This would be replaced with an actual API call
  return [];
};

export const getCustomers = async (): Promise<User[]> => {
  // This would be replaced with an actual API call
  return [];
};

export type { Order, Invoice, Delivery };
