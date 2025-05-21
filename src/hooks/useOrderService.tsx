
import { useState, useEffect } from 'react';
import * as orderService from '@/services/order.service';
import { User } from '@/types/auth-types';
import type { Order, Invoice, Delivery, OrderItem } from '@/types/order-types';

// Re-exporting types
export type { Order, OrderItem, Invoice, Delivery } from '@/types/order-types';

// Define Customer type
export type Customer = User;

export function useOrderService() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    loadInvoices();
    loadDeliveries();
    loadCustomers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllDeliveries();
      setDeliveries(data);
    } catch (err: any) {
      setError(err.message || 'Error loading deliveries');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customers = await orderService.getCustomers();
      setCustomers(customers);
    } catch (err: any) {
      setError(err.message || 'Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (id: string) => {
    try {
      setLoading(true);
      return await orderService.getOrderById(id);
    } catch (err: any) {
      setError(err.message || `Error getting order ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (
    orderId: string,
    status: string,
    deliveryPersonId?: number,
    deliveryPersonName?: string
  ) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(orderId, status, deliveryPersonId, deliveryPersonName);
      await loadOrders();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error updating order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      orderService.payInvoice(invoiceId);
      await loadInvoices();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error paying invoice');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    invoices,
    deliveries,
    customers,
    loading,
    error,
    loadOrders,
    loadInvoices,
    loadDeliveries,
    loadCustomers,
    getOrder,
    updateOrder,
    payInvoice: handlePayInvoice,
  };
}
