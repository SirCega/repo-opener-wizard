
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addInventoryMovement } from "./inventory.service";

// Tipos para pedidos y facturas
export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  warehouseId?: string;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  customerId: string;
  customerName?: string;
  date?: string;
  total?: number;
  status: 'pendiente' | 'en proceso' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  address: string;
  paymentMethod?: string;
  paymentStatus: 'pendiente' | 'pagado' | 'fallido';
  notes?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  orderId: string;
  orderNumber?: string;
  date?: string;
  customerName?: string;
  customerAddress?: string;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status: 'emitida' | 'pagada' | 'vencida' | 'anulada';
  dueDate: string;
  pdfUrl?: string;
}

export interface Delivery {
  id?: string;
  orderId: string;
  orderNumber?: string;
  deliveryPersonId: string;
  deliveryPersonName?: string;
  status: 'asignado' | 'en camino' | 'entregado' | 'fallido';
  assignedAt?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  address?: string;
  customerName?: string;
}

// Función para obtener todos los clientes
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, address')
    .eq('role', 'cliente');

  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  return data;
};

// Función para buscar un cliente por ID
export const getCustomerById = async (id: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, address')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Función para agregar un nuevo cliente
export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  // En un sistema real, esto debería manejar la autenticación también
  const { data, error } = await supabase
    .from('users')
    .insert([{
      name: customer.name,
      email: customer.email,
      address: customer.address,
      role: 'cliente',
      password: 'defaultpassword' // En producción usar hash y contraseña temporal
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding customer:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    address: data.address
  };
};

// Función para encontrar o crear un cliente desde la información del usuario actual
export const findOrCreateCustomerFromUser = async (user: { id?: string; name: string; email: string; address?: string }): Promise<Customer> => {
  console.log("Buscando cliente para usuario:", user);
  
  let existingCustomer;
  
  // Si el usuario tiene un ID, buscar por ID
  if (user.id) {
    try {
      existingCustomer = await getCustomerById(user.id);
      console.log("Cliente encontrado por ID:", existingCustomer);
      return existingCustomer;
    } catch (error) {
      console.log("No se encontró cliente con ese ID, buscando por email");
    }
  }
  
  // Si no existe por ID o no tiene ID, buscar por email
  const { data } = await supabase
    .from('users')
    .select('id, name, email, address')
    .eq('email', user.email)
    .limit(1);

  if (data && data.length > 0) {
    console.log("Cliente encontrado por email:", data[0]);
    return data[0];
  }
  
  // Si no existe y no tiene dirección, lanzar error
  if (!user.address) {
    console.error("Error: Se requiere una dirección para crear un cliente", user);
    throw new Error("Se requiere una dirección para crear un cliente");
  }
  
  // Si no existe, crear un nuevo cliente
  console.log("Creando nuevo cliente:", user);
  const newCustomer = await addCustomer({
    name: user.name,
    email: user.email,
    address: user.address
  });
  
  console.log("Nuevo cliente creado:", newCustomer);
  return newCustomer;
};

// Función para obtener todos los pedidos
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_id,
      users!orders_customer_id_fkey(name),
      status,
      total_amount,
      shipping_address,
      payment_method,
      payment_status,
      notes,
      created_at,
      deliveries(delivery_person_id, users(name))
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  // Para cada pedido, obtener los items
  const orders = await Promise.all(data.map(async (order) => {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        products(name),
        quantity,
        unit_price,
        subtotal,
        warehouse_id
      `)
      .eq('order_id', order.id);

    if (itemsError) {
      console.error(`Error fetching items for order ${order.id}:`, itemsError);
      throw itemsError;
    }

    const orderItems: OrderItem[] = items.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.products?.name,
      quantity: item.quantity,
      price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      warehouseId: item.warehouse_id
    }));

    // Generar un número de pedido a partir del ID
    const orderNumber = `ORD-${order.id.substring(0, 8).toUpperCase()}`;

    // Obtener información del repartidor si existe
    let deliveryPersonId = null;
    let deliveryPersonName = null;
    
    if (order.deliveries && order.deliveries.length > 0) {
      deliveryPersonId = order.deliveries[0].delivery_person_id;
      deliveryPersonName = order.deliveries[0].users?.name;
    }

    return {
      id: order.id,
      orderNumber,
      customerId: order.customer_id,
      customerName: order.users?.name,
      date: order.created_at,
      total: Number(order.total_amount),
      status: order.status,
      items: orderItems,
      address: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      notes: order.notes,
      deliveryPersonId,
      deliveryPersonName
    };
  }));

  return orders;
};

// Función para obtener un pedido por ID
export const getOrderById = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_id,
      users!orders_customer_id_fkey(name),
      status,
      total_amount,
      shipping_address,
      payment_method,
      payment_status,
      notes,
      created_at,
      deliveries(delivery_person_id, users(name))
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }

  // Obtener los items del pedido
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      product_id,
      products(name),
      quantity,
      unit_price,
      subtotal,
      warehouse_id
    `)
    .eq('order_id', id);

  if (itemsError) {
    console.error(`Error fetching items for order ${id}:`, itemsError);
    throw itemsError;
  }

  const orderItems: OrderItem[] = items.map(item => ({
    id: item.id,
    productId: item.product_id,
    productName: item.products?.name,
    quantity: item.quantity,
    price: Number(item.unit_price),
    subtotal: Number(item.subtotal),
    warehouseId: item.warehouse_id
  }));

  // Generar un número de pedido a partir del ID
  const orderNumber = `ORD-${data.id.substring(0, 8).toUpperCase()}`;

  // Obtener información del repartidor si existe
  let deliveryPersonId = null;
  let deliveryPersonName = null;
  
  if (data.deliveries && data.deliveries.length > 0) {
    deliveryPersonId = data.deliveries[0].delivery_person_id;
    deliveryPersonName = data.deliveries[0].users?.name;
  }

  return {
    id: data.id,
    orderNumber,
    customerId: data.customer_id,
    customerName: data.users?.name,
    date: data.created_at,
    total: Number(data.total_amount),
    status: data.status,
    items: orderItems,
    address: data.shipping_address,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    notes: data.notes,
    deliveryPersonId,
    deliveryPersonName
  };
};

// Función para crear un nuevo pedido
export const createOrder = async (orderData: {
  customerId: string;
  items: OrderItem[];
  address: string;
  paymentMethod?: string;
  notes?: string;
}): Promise<Order> => {
  console.log("Creando pedido con datos:", orderData);

  // Calcular el total del pedido
  const total = orderData.items.reduce((sum, item) => {
    const subtotal = item.price * item.quantity;
    return sum + subtotal;
  }, 0);

  // 1. Crear el pedido
  const { data: order, error } = await supabase
    .from('orders')
    .insert([{
      customer_id: orderData.customerId,
      total_amount: total,
      shipping_address: orderData.address,
      status: 'pendiente',
      payment_method: orderData.paymentMethod || 'efectivo',
      payment_status: 'pendiente',
      notes: orderData.notes
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  // 2. Insertar los items del pedido
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity,
    warehouse_id: item.warehouseId || 'bd76b4a4-0794-4407-9ce1-2d89e9ee50ab' // ID de la bodega principal
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error("Error adding order items:", itemsError);
    // Eliminar el pedido si hay error en los items
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  // 3. Actualizar el inventario (reducir stock)
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  for (const item of orderData.items) {
    try {
      // Registrar salida de inventario
      await addInventoryMovement(
        item.productId,
        'salida',
        item.quantity,
        userId || order.customer_id, // Si no hay usuario autenticado, usar el cliente
        item.warehouseId || 'bd76b4a4-0794-4407-9ce1-2d89e9ee50ab', // ID de la bodega principal
        `Pedido ${order.id.substring(0, 8).toUpperCase()}`
      );
    } catch (error) {
      console.error(`Error updating inventory for product ${item.productId}:`, error);
      // No cancelamos el pedido, pero registramos el error
    }
  }

  // 4. Crear factura automáticamente
  await createInvoiceFromOrder(order.id);

  // Obtener el pedido completo con sus items
  return getOrderById(order.id);
};

// Función para actualizar el estado de un pedido
export const updateOrderStatus = async (
  orderId: string, 
  status: 'pendiente' | 'en proceso' | 'enviado' | 'entregado' | 'cancelado',
  deliveryPersonId?: string
): Promise<Order> => {
  // 1. Actualizar el estado del pedido
  const { data: order, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating order ${orderId}:`, error);
    throw error;
  }

  // 2. Si el estado es "enviado" y hay un repartidor asignado, crear o actualizar la entrega
  if (status === 'enviado' && deliveryPersonId) {
    // Verificar si ya existe una entrega para este pedido
    const { data: existingDelivery } = await supabase
      .from('deliveries')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingDelivery) {
      // Actualizar la entrega existente
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .update({
          delivery_person_id: deliveryPersonId,
          status: 'asignado',
          estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas desde ahora
        })
        .eq('id', existingDelivery.id);

      if (deliveryError) {
        console.error(`Error updating delivery for order ${orderId}:`, deliveryError);
        throw deliveryError;
      }
    } else {
      // Crear una nueva entrega
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert([{
          order_id: orderId,
          delivery_person_id: deliveryPersonId,
          status: 'asignado',
          estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas desde ahora
        }]);

      if (deliveryError) {
        console.error(`Error creating delivery for order ${orderId}:`, deliveryError);
        throw deliveryError;
      }
    }
  }

  // 3. Si el estado es "cancelado", actualizar el inventario (restaurar stock) y la factura
  if (status === 'cancelado') {
    // Obtener los items del pedido
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, warehouse_id')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error(`Error fetching items for canceled order ${orderId}:`, itemsError);
      throw itemsError;
    }

    // Restaurar el inventario
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    for (const item of items) {
      try {
        // Registrar entrada de inventario (restauración)
        await addInventoryMovement(
          item.product_id,
          'entrada',
          item.quantity,
          userId || order.customer_id, // Si no hay usuario autenticado, usar el cliente
          item.warehouse_id,
          `Cancelación de pedido ${orderId.substring(0, 8).toUpperCase()}`
        );
      } catch (error) {
        console.error(`Error restoring inventory for product ${item.product_id}:`, error);
        // No detenemos el proceso, pero registramos el error
      }
    }

    // Actualizar la factura asociada
    await updateInvoiceStatusByOrderId(orderId, 'anulada');
  }

  // Obtener el pedido actualizado con toda su información
  return getOrderById(orderId);
};

// Función para obtener todas las facturas
export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      order_id,
      orders(
        id,
        users(name),
        shipping_address,
        order_items(
          product_id,
          products(name),
          quantity,
          unit_price,
          subtotal
        )
      ),
      issue_date,
      due_date,
      total_amount,
      tax_amount,
      status,
      pdf_url
    `)
    .order('issue_date', { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }

  const invoices: Invoice[] = data.map(invoice => {
    // Construir el número de factura si no existe
    const invoiceNumber = invoice.invoice_number || `INV-${invoice.id.substring(0, 8).toUpperCase()}`;
    
    // Obtener datos del cliente y dirección
    const customerName = invoice.orders?.users?.name;
    const customerAddress = invoice.orders?.shipping_address;
    
    // Transformar los items de la orden
    const items: OrderItem[] = invoice.orders?.order_items.map(item => ({
      productId: item.product_id,
      productName: item.products?.name,
      quantity: item.quantity,
      price: Number(item.unit_price),
      subtotal: Number(item.subtotal)
    })) || [];
    
    // Calcular el subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    return {
      id: invoice.id,
      invoiceNumber,
      orderId: invoice.order_id,
      orderNumber: `ORD-${invoice.order_id.substring(0, 8).toUpperCase()}`,
      date: invoice.issue_date,
      dueDate: invoice.due_date,
      customerName,
      customerAddress,
      items,
      subtotal,
      tax: Number(invoice.tax_amount),
      total: Number(invoice.total_amount),
      status: invoice.status,
      pdfUrl: invoice.pdf_url
    };
  });

  return invoices;
};

// Función para obtener una factura por ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      order_id,
      orders(
        id,
        users(name),
        shipping_address,
        order_items(
          product_id,
          products(name),
          quantity,
          unit_price,
          subtotal
        )
      ),
      issue_date,
      due_date,
      total_amount,
      tax_amount,
      status,
      pdf_url
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  }

  // Construir el número de factura si no existe
  const invoiceNumber = data.invoice_number || `INV-${data.id.substring(0, 8).toUpperCase()}`;
    
  // Obtener datos del cliente y dirección
  const customerName = data.orders?.users?.name;
  const customerAddress = data.orders?.shipping_address;
  
  // Transformar los items de la orden
  const items: OrderItem[] = data.orders?.order_items.map(item => ({
    productId: item.product_id,
    productName: item.products?.name,
    quantity: item.quantity,
    price: Number(item.unit_price),
    subtotal: Number(item.subtotal)
  })) || [];
  
  // Calcular el subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  return {
    id: data.id,
    invoiceNumber,
    orderId: data.order_id,
    orderNumber: `ORD-${data.order_id.substring(0, 8).toUpperCase()}`,
    date: data.issue_date,
    dueDate: data.due_date,
    customerName,
    customerAddress,
    items,
    subtotal,
    tax: Number(data.tax_amount),
    total: Number(data.total_amount),
    status: data.status,
    pdfUrl: data.pdf_url
  };
};

// Función para crear una factura a partir de un pedido
export const createInvoiceFromOrder = async (orderId: string): Promise<Invoice> => {
  // 1. Obtener información del pedido
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      users(name),
      shipping_address
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error(`Error fetching order ${orderId} for invoice:`, error);
    throw error;
  }

  // 2. Calcular datos de la factura
  const subtotal = Number(order.total_amount);
  const taxRate = 0.19; // 19% IVA
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  
  // Generar número de factura único
  const invoiceNumber = `INV-${Date.now().toString().substring(7)}`;
  
  // Establecer fecha de vencimiento (30 días)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  // 3. Crear la factura
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([{
      order_id: orderId,
      invoice_number: invoiceNumber,
      due_date: dueDate.toISOString(),
      total_amount: totalAmount,
      tax_amount: taxAmount,
      status: 'emitida'
    }])
    .select()
    .single();

  if (invoiceError) {
    console.error(`Error creating invoice for order ${orderId}:`, invoiceError);
    throw invoiceError;
  }

  // 4. Generar URL de PDF (simulado por ahora)
  const pdfUrl = `https://example.com/invoices/${invoice.id}.pdf`;
  
  // 5. Actualizar la factura con la URL del PDF
  const { error: updateError } = await supabase
    .from('invoices')
    .update({ pdf_url: pdfUrl })
    .eq('id', invoice.id);

  if (updateError) {
    console.error(`Error updating invoice ${invoice.id} with PDF URL:`, updateError);
    // No es crítico, continuar sin lanzar error
  }

  // 6. Retornar la factura creada
  return getInvoiceById(invoice.id);
};

// Función para actualizar el estado de una factura por ID de pedido
export const updateInvoiceStatusByOrderId = async (
  orderId: string, 
  status: 'emitida' | 'pagada' | 'vencida' | 'anulada'
): Promise<Invoice | null> => {
  // 1. Buscar la factura por ID de pedido
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching invoice for order ${orderId}:`, error);
    throw error;
  }

  if (!invoice) {
    console.warn(`No invoice found for order ${orderId}`);
    return null;
  }

  // 2. Actualizar el estado de la factura
  const { error: updateError } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoice.id);

  if (updateError) {
    console.error(`Error updating invoice status for order ${orderId}:`, updateError);
    throw updateError;
  }

  // 3. Retornar la factura actualizada
  return getInvoiceById(invoice.id);
};

// Función para marcar una factura como pagada
export const payInvoice = async (invoiceId: string): Promise<Invoice> => {
  // 1. Actualizar el estado de la factura
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'pagada' })
    .eq('id', invoiceId);

  if (error) {
    console.error(`Error updating invoice ${invoiceId} status to paid:`, error);
    throw error;
  }

  // 2. Obtener la factura actualizada
  const invoice = await getInvoiceById(invoiceId);
  
  // 3. Actualizar el estado de pago del pedido
  const { error: orderError } = await supabase
    .from('orders')
    .update({ payment_status: 'pagado' })
    .eq('id', invoice.orderId);

  if (orderError) {
    console.error(`Error updating payment status for order ${invoice.orderId}:`, orderError);
    // No crítico, continuar sin lanzar error
  }

  return invoice;
};

// Función para obtener todas las entregas
export const getDeliveries = async (): Promise<Delivery[]> => {
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      delivery_person_id,
      users!deliveries_delivery_person_id_fkey(name),
      status,
      assigned_at,
      estimated_delivery,
      actual_delivery,
      notes,
      orders(
        shipping_address,
        users(name)
      )
    `)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error("Error fetching deliveries:", error);
    throw error;
  }

  return data.map(delivery => ({
    id: delivery.id,
    orderId: delivery.order_id,
    orderNumber: `ORD-${delivery.order_id.substring(0, 8).toUpperCase()}`,
    deliveryPersonId: delivery.delivery_person_id,
    deliveryPersonName: delivery.users?.name,
    status: delivery.status,
    assignedAt: delivery.assigned_at,
    estimatedDelivery: delivery.estimated_delivery,
    actualDelivery: delivery.actual_delivery,
    notes: delivery.notes,
    address: delivery.orders?.shipping_address,
    customerName: delivery.orders?.users?.name
  }));
};

// Función para obtener las entregas asignadas a un repartidor
export const getDeliveriesByDeliveryPerson = async (deliveryPersonId: string): Promise<Delivery[]> => {
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      delivery_person_id,
      users!deliveries_delivery_person_id_fkey(name),
      status,
      assigned_at,
      estimated_delivery,
      actual_delivery,
      notes,
      orders(
        shipping_address,
        users(name)
      )
    `)
    .eq('delivery_person_id', deliveryPersonId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error(`Error fetching deliveries for delivery person ${deliveryPersonId}:`, error);
    throw error;
  }

  return data.map(delivery => ({
    id: delivery.id,
    orderId: delivery.order_id,
    orderNumber: `ORD-${delivery.order_id.substring(0, 8).toUpperCase()}`,
    deliveryPersonId: delivery.delivery_person_id,
    deliveryPersonName: delivery.users?.name,
    status: delivery.status,
    assignedAt: delivery.assigned_at,
    estimatedDelivery: delivery.estimated_delivery,
    actualDelivery: delivery.actual_delivery,
    notes: delivery.notes,
    address: delivery.orders?.shipping_address,
    customerName: delivery.orders?.users?.name
  }));
};

// Función para actualizar el estado de una entrega
export const updateDeliveryStatus = async (
  deliveryId: string,
  status: 'asignado' | 'en camino' | 'entregado' | 'fallido',
  notes?: string
): Promise<Delivery> => {
  const updates: any = { status };
  
  // Agregar timestamp correspondiente según el estado
  if (status === 'entregado') {
    updates.actual_delivery = new Date().toISOString();
  }
  
  if (notes) {
    updates.notes = notes;
  }

  // 1. Actualizar la entrega
  const { data, error } = await supabase
    .from('deliveries')
    .update(updates)
    .eq('id', deliveryId)
    .select(`
      id,
      order_id,
      status
    `)
    .single();

  if (error) {
    console.error(`Error updating delivery ${deliveryId} status:`, error);
    throw error;
  }

  // 2. Si la entrega se marca como entregada, actualizar también el pedido
  if (status === 'entregado') {
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'entregado',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.order_id);

    if (orderError) {
      console.error(`Error updating order ${data.order_id} status:`, orderError);
      throw orderError;
    }
  }
  
  // 3. Si la entrega se marca como fallida, actualizar el pedido a pendiente
  if (status === 'fallido') {
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'pendiente',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.order_id);

    if (orderError) {
      console.error(`Error updating order ${data.order_id} status:`, orderError);
      throw orderError;
    }
  }

  // 4. Obtener la entrega completa
  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      delivery_person_id,
      users!deliveries_delivery_person_id_fkey(name),
      status,
      assigned_at,
      estimated_delivery,
      actual_delivery,
      notes,
      orders(
        shipping_address,
        users(name)
      )
    `)
    .eq('id', deliveryId)
    .single();

  if (deliveryError) {
    console.error(`Error fetching updated delivery ${deliveryId}:`, deliveryError);
    throw deliveryError;
  }

  return {
    id: delivery.id,
    orderId: delivery.order_id,
    orderNumber: `ORD-${delivery.order_id.substring(0, 8).toUpperCase()}`,
    deliveryPersonId: delivery.delivery_person_id,
    deliveryPersonName: delivery.users?.name,
    status: delivery.status,
    assignedAt: delivery.assigned_at,
    estimatedDelivery: delivery.estimated_delivery,
    actualDelivery: delivery.actual_delivery,
    notes: delivery.notes,
    address: delivery.orders?.shipping_address,
    customerName: delivery.orders?.users?.name
  };
};

// Hook para usar el servicio de pedidos con toast notifications
export const useOrderService = () => {
  const { toast } = useToast();
  
  return {
    getCustomers,
    addCustomer: async (customer: Omit<Customer, 'id'>) => {
      try {
        const newCustomer = await addCustomer(customer);
        toast({
          title: "Cliente agregado",
          description: `${customer.name} ha sido agregado correctamente.`
        });
        return newCustomer;
      } catch (error: any) {
        toast({
          title: "Error al agregar cliente",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    getOrders,
    getOrderById,
    findOrCreateCustomerFromUser,
    
    createOrder: async (orderData: { 
      customerId: string; 
      items: OrderItem[];
      address: string;
      paymentMethod?: string;
      notes?: string;
    }) => {
      try {
        const newOrder = await createOrder(orderData);
        toast({
          title: "Pedido creado",
          description: `Pedido #${newOrder.orderNumber} creado exitosamente.`
        });
        return newOrder;
      } catch (error: any) {
        toast({
          title: "Error al crear el pedido",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    updateOrderStatus: async (
      orderId: string, 
      status: 'pendiente' | 'en proceso' | 'enviado' | 'entregado' | 'cancelado',
      deliveryPersonId?: string
    ) => {
      try {
        const updatedOrder = await updateOrderStatus(orderId, status, deliveryPersonId);
        
        // Mensajes personalizados según el estado
        let statusMessage = '';
        switch (status) {
          case 'en proceso':
            statusMessage = 'en preparación';
            break;
          case 'enviado':
            statusMessage = 'enviado';
            break;
          case 'entregado':
            statusMessage = 'entregado';
            break;
          case 'cancelado':
            statusMessage = 'cancelado';
            break;
          default:
            statusMessage = status;
        }
        
        toast({
          title: `Pedido ${statusMessage}`,
          description: `El pedido #${updatedOrder.orderNumber} ha sido actualizado.`
        });
        
        return updatedOrder;
      } catch (error: any) {
        toast({
          title: "Error al actualizar el pedido",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    getInvoices,
    getInvoiceById,
    
    // Función para marcar una factura como pagada
    payInvoice: async (invoiceId: string) => {
      try {
        const updatedInvoice = await payInvoice(invoiceId);
        toast({
          title: "Factura pagada",
          description: `La factura #${updatedInvoice.invoiceNumber} ha sido marcada como pagada.`
        });
        return updatedInvoice;
      } catch (error: any) {
        toast({
          title: "Error al pagar la factura",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },

    // Funcionalidad de entregas
    getDeliveries,
    getDeliveriesByDeliveryPerson,
    
    updateDeliveryStatus: async (
      deliveryId: string,
      status: 'asignado' | 'en camino' | 'entregado' | 'fallido',
      notes?: string
    ) => {
      try {
        const updatedDelivery = await updateDeliveryStatus(deliveryId, status, notes);
        
        let statusMessage = '';
        switch (status) {
          case 'en camino':
            statusMessage = 'en camino';
            break;
          case 'entregado':
            statusMessage = 'entregada';
            break;
          case 'fallido':
            statusMessage = 'fallida';
            break;
          default:
            statusMessage = status;
        }
        
        toast({
          title: `Entrega ${statusMessage}`,
          description: `La entrega del pedido #${updatedDelivery.orderNumber} ha sido actualizada.`
        });
        
        return updatedDelivery;
      } catch (error: any) {
        toast({
          title: "Error al actualizar la entrega",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },

    // Función para generar PDF de factura (simulado)
    generateInvoicePDF: async (invoiceId: string) => {
      try {
        const invoice = await getInvoiceById(invoiceId);
        
        // En un sistema real, aquí se generaría el PDF
        // Simulamos un éxito
        toast({
          title: "PDF generado",
          description: `La factura #${invoice.invoiceNumber} ha sido generada como PDF.`
        });
        
        return true;
      } catch (error: any) {
        toast({
          title: "Error al generar PDF",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },

    // Función para imprimir factura (simulado)
    printInvoice: async (invoiceId: string) => {
      try {
        const invoice = await getInvoiceById(invoiceId);
        
        // En un sistema real, aquí se enviaría a imprimir
        // Simulamos un éxito
        toast({
          title: "Enviado a imprimir",
          description: `La factura #${invoice.invoiceNumber} ha sido enviada a la impresora.`
        });
        
        return true;
      } catch (error: any) {
        toast({
          title: "Error al imprimir",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    }
  };
};
