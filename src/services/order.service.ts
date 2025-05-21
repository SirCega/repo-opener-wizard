
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth-types';
import { 
  Order, 
  OrderItem, 
  Invoice, 
  Delivery,
  Customer
} from '@/types/order-types';

export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id (name, email, address)
      `);

    if (error) throw error;

    // Transform to match the expected Order type
    return data.map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id.substring(0, 5)}`,
      customer: order.customer?.name || 'Cliente no especificado',
      customerId: order.customer_id,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: order.status,
      address: order.shipping_address,
      total: Number(order.total_amount),
      customer_id: order.customer_id,
      shipping_address: order.shipping_address,
      total_amount: Number(order.total_amount),
      payment_status: order.payment_status,
      // Load items separately as they're in a different table
      items: []
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getAllOrders = getOrders; // Alias for backwards compatibility

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customer_id (name, email, address)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id (name, sku, price)
      `)
      .eq('order_id', id);
    
    if (itemsError) throw itemsError;
    
    // Transform items to match OrderItem type
    const orderItems = items.map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      warehouse_id: item.warehouse_id,
      productName: item.product?.name || 'Producto no especificado',
      price: Number(item.product?.price || 0)
    }));

    return {
      id: data.id,
      orderNumber: `ORD-${data.id.substring(0, 5)}`,
      customer: data.customer?.name || 'Cliente no especificado',
      customerId: data.customer_id,
      date: new Date(data.created_at).toISOString().split('T')[0],
      status: data.status,
      address: data.shipping_address,
      total: Number(data.total_amount),
      customer_id: data.customer_id,
      shipping_address: data.shipping_address,
      total_amount: Number(data.total_amount),
      payment_status: data.payment_status,
      items: orderItems
    };
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: string,
  deliveryPersonId?: string,
  deliveryPersonName?: string
): Promise<Order> => {
  try {
    const updates: any = { status };
    
    // Update in database
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        customer:customer_id (name, email, address)
      `)
      .single();
    
    if (error) throw error;
    
    // If assigning to delivery person
    if (status === 'enviado' && deliveryPersonId) {
      const deliveryData = {
        order_id: orderId,
        delivery_person_id: deliveryPersonId,
        status: 'en_ruta',
        assigned_at: new Date().toISOString()
      };
      
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .upsert(deliveryData);
      
      if (deliveryError) throw deliveryError;
    }
    
    // Return the updated order
    return {
      id: data.id,
      orderNumber: `ORD-${data.id.substring(0, 5)}`,
      customer: data.customer?.name || 'Cliente no especificado',
      customerId: data.customer_id,
      date: new Date(data.created_at).toISOString().split('T')[0],
      status: data.status,
      address: data.shipping_address,
      total: Number(data.total_amount),
      customer_id: data.customer_id,
      shipping_address: data.shipping_address,
      total_amount: Number(data.total_amount),
      payment_status: data.payment_status,
      deliveryPersonId: deliveryPersonId,
      deliveryPersonName: deliveryPersonName,
      items: []
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        order:order_id (
          *,
          customer:customer_id (name, address)
        )
      `);
    
    if (error) throw error;
    
    return data.map(invoice => ({
      id: invoice.id,
      order_id: invoice.order_id,
      invoice_number: invoice.invoice_number,
      issue_date: new Date(invoice.issue_date).toISOString().split('T')[0],
      due_date: new Date(invoice.due_date).toISOString().split('T')[0],
      total_amount: Number(invoice.total_amount),
      tax_amount: Number(invoice.tax_amount),
      status: invoice.status,
      orderNumber: `ORD-${invoice.order_id.substring(0, 5)}`,
      customerName: invoice.order?.customer?.name || 'Cliente no especificado',
      customerAddress: invoice.order?.customer?.address || 'Dirección no especificada',
      date: new Date(invoice.issue_date).toISOString().split('T')[0],
      subtotal: Number(invoice.total_amount) - Number(invoice.tax_amount),
      tax: Number(invoice.tax_amount),
      total: Number(invoice.total_amount),
      items: [] // Cargar items si es necesario
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

export const getInvoices = getAllInvoices; // Alias para compatibilidad

export const payInvoice = async (invoiceId: string): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'pagada' })
      .eq('id', invoiceId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Actualizar el estado de pago del pedido también
    const { error: orderError } = await supabase
      .from('orders')
      .update({ payment_status: 'pagado' })
      .eq('id', data.order_id);
    
    if (orderError) throw orderError;
    
    return {
      ...data,
      total_amount: Number(data.total_amount),
      tax_amount: Number(data.tax_amount),
      status: 'pagada',
      // Campos adicionales requeridos por el tipo Invoice
      orderNumber: `INV-${data.invoice_number}`,
      customerName: '', // Se completaría si se necesita
      customerAddress: '',
      date: new Date(data.issue_date).toISOString().split('T')[0],
      subtotal: Number(data.total_amount) - Number(data.tax_amount),
      tax: Number(data.tax_amount),
      total: Number(data.total_amount),
      items: []
    };
  } catch (error) {
    console.error('Error paying invoice:', error);
    throw error;
  }
};

export const getAllDeliveries = async (): Promise<Delivery[]> => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        order:order_id (
          *,
          customer:customer_id (name, address)
        ),
        delivery_person:delivery_person_id (name)
      `);
    
    if (error) throw error;
    
    return data.map(delivery => ({
      id: delivery.id,
      orderId: delivery.order_id,
      orderNumber: `ORD-${delivery.order_id.substring(0, 5)}`,
      customer: delivery.order?.customer?.name || 'Cliente no especificado',
      address: delivery.order?.customer?.address || 'Dirección no especificada',
      status: delivery.status,
      deliveryPersonId: delivery.delivery_person_id,
      deliveryPersonName: delivery.delivery_person?.name || 'Repartidor no asignado',
      assignedAt: delivery.assigned_at,
      estimatedDelivery: delivery.estimated_delivery,
      actualDelivery: delivery.actual_delivery,
      notes: delivery.notes || ''
    }));
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return [];
  }
};

export const getDeliveries = getAllDeliveries; // Alias para compatibilidad

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'cliente');
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address || ''
    }));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const createOrder = async (orderData: Omit<Order, "id">): Promise<Order> => {
  try {
    // Crear la orden primero
    const orderInsert = {
      customer_id: orderData.customer_id,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total || 0,
      payment_status: orderData.payment_status || 'pendiente',
      status: orderData.status || 'preparacion',
      notes: orderData.notes || ''
    };
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();
    
    if (error) throw error;
    
    // Crear los items de la orden
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        subtotal: item.subtotal || (item.quantity * (item.unit_price || item.price)),
        warehouse_id: item.warehouse_id
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
    }
    
    // Retornar la orden creada con formato adecuado
    return {
      id: order.id,
      orderNumber: `ORD-${order.id.substring(0, 5)}`,
      customer: '', // Se completaría si se necesita
      customerId: order.customer_id,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: order.status,
      address: order.shipping_address,
      total: Number(order.total_amount),
      customer_id: order.customer_id,
      shipping_address: order.shipping_address,
      total_amount: Number(order.total_amount),
      payment_status: order.payment_status,
      items: orderData.items || []
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Hook para usar el servicio de órdenes
export const useOrderService = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Cargar órdenes
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(`Error al cargar órdenes: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar facturas
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(`Error al cargar facturas: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar entregas
  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await getAllDeliveries();
      setDeliveries(data);
    } catch (err: any) {
      setError(`Error al cargar entregas: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data as User[]);
    } catch (err: any) {
      setError(`Error al cargar clientes: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Inicializar datos al montar el componente
  useEffect(() => {
    loadOrders();
    loadInvoices();
    loadDeliveries();
    loadCustomers();
  }, []);

  // Actualizar estado de orden
  const handleUpdateOrderStatus = async (
    orderId: string, 
    status: string, 
    deliveryPersonId?: string,
    deliveryPersonName?: string
  ) => {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, status, deliveryPersonId, deliveryPersonName);
      await loadOrders();
      await loadDeliveries();
      return true;
    } catch (err: any) {
      setError(`Error al actualizar estado: ${err.message}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Pagar factura
  const handlePayInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      await payInvoice(invoiceId);
      await loadInvoices();
      await loadOrders();
      return true;
    } catch (err: any) {
      setError(`Error al procesar pago: ${err.message}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Crear una nueva orden
  const handleCreateOrder = async (orderData: Omit<Order, "id">) => {
    try {
      setLoading(true);
      const newOrder = await createOrder(orderData);
      setOrders(prevOrders => [...prevOrders, newOrder]);
      return newOrder;
    } catch (err: any) {
      setError(`Error al crear orden: ${err.message}`);
      console.error(err);
      throw err;
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
    updateOrderStatus: handleUpdateOrderStatus,
    payInvoice: handlePayInvoice,
    createOrder: handleCreateOrder,
    // Métodos adicionales para compatibilidad con código existente
    getAllOrders: loadOrders,
    getAllInvoices: loadInvoices,
    getAllDeliveries: loadDeliveries,
    getCustomers: loadCustomers
  };
};

// Exportar los tipos
export type { Order, OrderItem, Invoice, Delivery, Customer };
