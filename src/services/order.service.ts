
import { supabase } from '@/integrations/supabase/client';
import { Order, Invoice, Delivery, OrderItem } from '@/types/order-types';
import { User } from '@/types/auth-types';

/**
 * Obtener todos los pedidos
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customer_id(id, name, email, address, role)');
      
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    
    return data.map(order => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status,
      paymentStatus: order.payment_status,
      shipping_address: order.shipping_address,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: order.customer
    })) || [];
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return [];
  }
};

/**
 * Alias of getAllOrders for backward compatibility
 */
export const getOrders = getAllOrders;

/**
 * Obtener todas las facturas
 */
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, order:order_id(*)');
      
    if (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
    
    return data.map(invoice => {
      const order = invoice.order ? {
        id: invoice.order.id,
        customerId: invoice.order.customer_id,
        status: invoice.order.status,
        paymentStatus: invoice.order.payment_status,
        shipping_address: invoice.order.shipping_address,
        total_amount: invoice.order.total_amount,
        payment_method: invoice.order.payment_method,
        notes: invoice.order.notes,
        created_at: invoice.order.created_at,
        updated_at: invoice.order.updated_at
      } : undefined;

      return {
        ...invoice,
        order
      };
    }) || [];
  } catch (error) {
    console.error("Error in getAllInvoices:", error);
    return [];
  }
};

/**
 * Alias of getAllInvoices for backward compatibility
 */
export const getInvoices = getAllInvoices;

/**
 * Obtener todas las entregas
 */
export const getAllDeliveries = async (): Promise<Delivery[]> => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*, order:order_id(*), delivery_person:delivery_person_id(*)');
      
    if (error) {
      console.error("Error fetching deliveries:", error);
      return [];
    }
    
    return data.map(delivery => {
      const order = delivery.order ? {
        id: delivery.order.id,
        customerId: delivery.order.customer_id,
        status: delivery.order.status,
        paymentStatus: delivery.order.payment_status,
        shipping_address: delivery.order.shipping_address,
        total_amount: delivery.order.total_amount,
        payment_method: delivery.order.payment_method,
        notes: delivery.order.notes,
        created_at: delivery.order.created_at,
        updated_at: delivery.order.updated_at
      } : undefined;

      return {
        ...delivery,
        order
      };
    }) || [];
  } catch (error) {
    console.error("Error in getAllDeliveries:", error);
    return [];
  }
};

/**
 * Obtener un pedido por su ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customer_id(id, name, email, address, role), items:order_items(*)')
      .eq('id', orderId)
      .single();
      
    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }
    
    return data ? {
      id: data.id,
      customerId: data.customer_id,
      status: data.status,
      paymentStatus: data.payment_status,
      shipping_address: data.shipping_address,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      customer: data.customer,
      items: data.items
    } : null;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return null;
  }
};

/**
 * Actualizar el estado de un pedido
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
      
    if (error) {
      console.error("Error updating order status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return false;
  }
};

// Export all types from the types file for backward compatibility
export type { Order, OrderItem, Invoice, Delivery };

// Mock functions for development until proper implementation
export const getCustomers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'cliente');
      
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getCustomers:", error);
    return [];
  }
};
