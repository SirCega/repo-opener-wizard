
import { useToast } from "@/hooks/use-toast";
import { getInventory, updateProduct } from "./inventory.service";

// Tipos para pedidos y facturas
export interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  customerId: number;
  date: string;
  total: number;
  status: 'pendiente' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  address: string;
  deliveryPersonId?: number;
  deliveryPersonName?: string;
  warehouseSource?: string; // Nueva propiedad para bodega de origen
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  orderId: number;
  date: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pendiente' | 'pagada' | 'cancelada';
}

// Almacenamiento local para simular persistencia en el cliente
const ORDERS_STORAGE_KEY = 'likistock_orders';
const INVOICES_STORAGE_KEY = 'likistock_invoices';
const CUSTOMERS_STORAGE_KEY = 'likistock_customers';

// Datos de ejemplo de clientes
const defaultCustomers: Customer[] = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", address: "Calle 123 #45-67, Bogotá" },
  { id: 2, name: "María López", email: "maria@example.com", address: "Avenida 45 #12-34, Medellín" },
  { id: 3, name: "Carlos Rodríguez", email: "carlos@example.com", address: "Carrera 67 #89-12, Cali" },
  { id: 4, name: "Ana Martínez", email: "ana@example.com", address: "Calle 34 #56-78, Barranquilla" },
  { id: 5, name: "Pedro Sánchez", email: "pedro@example.com", address: "Avenida 78 #90-12, Bucaramanga" },
];

// Datos de ejemplo de pedidos
const defaultOrders: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customer: "Juan Pérez",
    customerId: 1,
    date: "2024-04-15",
    total: 124.50,
    status: "pendiente",
    items: [
      { productId: 1, productName: "Whisky Premium", quantity: 2, price: 50.00 },
      { productId: 7, productName: "Cerveza Artesanal", quantity: 6, price: 3.00 }
    ],
    address: "Calle 123 #45-67, Bogotá",
    warehouseSource: "warehouse1"
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customer: "María López",
    customerId: 2,
    date: "2024-04-14",
    total: 78.20,
    status: "preparacion",
    items: [
      { productId: 2, productName: "Aguardiente Antioqueño", quantity: 3, price: 20.00 },
      { productId: 4, productName: "Vodka Importado", quantity: 1, price: 32.00 }
    ],
    address: "Avenida 45 #12-34, Medellín",
    warehouseSource: "mainWarehouse"
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customer: "Carlos Rodríguez",
    customerId: 3,
    date: "2024-04-13",
    total: 245.00,
    status: "enviado",
    items: [
      { productId: 1, productName: "Whisky Premium", quantity: 4, price: 50.00 },
      { productId: 5, productName: "Tequila Reposado", quantity: 1, price: 45.00 }
    ],
    address: "Carrera 67 #89-12, Cali",
    deliveryPersonId: 1,
    deliveryPersonName: "Luis Torres",
    warehouseSource: "warehouse2"
  }
];

// Función para inicializar los datos de clientes
export const getCustomers = (): Customer[] => {
  const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  if (storedCustomers) {
    return JSON.parse(storedCustomers);
  }
  
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(defaultCustomers));
  return defaultCustomers;
};

// Función para guardar los clientes
export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

// Función para añadir un nuevo cliente
export const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const customers = getCustomers();
  
  // Generar un nuevo ID
  const newId = customers.length > 0 
    ? Math.max(...customers.map(c => c.id)) + 1 
    : 1;
  
  // Crear el nuevo cliente con ID
  const newCustomer: Customer = {
    ...customer,
    id: newId
  };
  
  // Agregar al listado y guardar
  customers.push(newCustomer);
  saveCustomers(customers);
  
  return newCustomer;
};

// Función para inicializar los datos de pedidos
export const getOrders = (): Order[] => {
  const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (storedOrders) {
    return JSON.parse(storedOrders);
  }
  
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(defaultOrders));
  return defaultOrders;
};

// Función para guardar los pedidos
export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

// Función para generar un nuevo número de pedido
const generateOrderNumber = (): string => {
  const orders = getOrders();
  const lastOrderNumber = orders.length > 0 
    ? parseInt(orders[orders.length - 1].orderNumber.replace('ORD-', '')) 
    : 0;
  
  return `ORD-${String(lastOrderNumber + 1).padStart(3, '0')}`;
};

// Función para crear un nuevo pedido
export const createOrder = (orderData: {
  customerId: number;
  items: OrderItem[];
  warehouseSource?: string;
}): Order => {
  const orders = getOrders();
  const customers = getCustomers();
  const customer = customers.find(c => c.id === orderData.customerId);
  
  if (!customer) {
    throw new Error(`Cliente con ID ${orderData.customerId} no encontrado`);
  }
  
  // Calcular el total del pedido
  const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Generar un nuevo ID
  const newId = orders.length > 0 
    ? Math.max(...orders.map(o => o.id)) + 1 
    : 1;
  
  // Crear el nuevo pedido
  const newOrder: Order = {
    id: newId,
    orderNumber: generateOrderNumber(),
    customer: customer.name,
    customerId: customer.id,
    date: new Date().toISOString().split('T')[0], // Fecha actual
    total,
    status: 'pendiente',
    items: orderData.items,
    address: customer.address,
    warehouseSource: orderData.warehouseSource
  };
  
  // Agregar al listado y guardar
  orders.push(newOrder);
  saveOrders(orders);
  
  // Actualizar el inventario
  const inventory = getInventory();
  orderData.items.forEach(item => {
    const product = inventory.find(p => p.id === item.productId);
    if (product) {
      // Restar del inventario de la bodega seleccionada
      if (orderData.warehouseSource === "warehouse1" && product.warehouse1 >= item.quantity) {
        product.warehouse1 -= item.quantity;
      } else if (orderData.warehouseSource === "warehouse2" && product.warehouse2 >= item.quantity) {
        product.warehouse2 -= item.quantity;
      } else if (orderData.warehouseSource === "warehouse3" && product.warehouse3 >= item.quantity) {
        product.warehouse3 -= item.quantity;
      } else if (orderData.warehouseSource === "mainWarehouse" && product.mainWarehouse >= item.quantity) {
        product.mainWarehouse -= item.quantity;
      } else {
        // Si no hay suficiente stock en la bodega seleccionada
        throw new Error(`No hay suficiente stock del producto "${item.productName}" en la bodega seleccionada`);
      }
      
      updateProduct(product);
    }
  });
  
  // Generar factura automáticamente
  createInvoiceFromOrder(newOrder);
  
  return newOrder;
};

// Función para actualizar el estado de un pedido
export const updateOrderStatus = (
  orderId: number, 
  status: 'pendiente' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado',
  deliveryPersonId?: number,
  deliveryPersonName?: string
): Order => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) {
    throw new Error(`Pedido con ID ${orderId} no encontrado`);
  }
  
  // Actualizar el estado del pedido
  orders[index] = {
    ...orders[index],
    status,
    ...(deliveryPersonId && { deliveryPersonId }),
    ...(deliveryPersonName && { deliveryPersonName })
  };
  
  saveOrders(orders);
  
  // Si se cancela el pedido, restaurar inventario
  if (status === 'cancelado') {
    const inventory = getInventory();
    orders[index].items.forEach(item => {
      const product = inventory.find(p => p.id === item.productId);
      if (product) {
        // Restaurar al inventario de la bodega de origen
        if (orders[index].warehouseSource === "warehouse1") {
          product.warehouse1 += item.quantity;
        } else if (orders[index].warehouseSource === "warehouse2") {
          product.warehouse2 += item.quantity;
        } else if (orders[index].warehouseSource === "warehouse3") {
          product.warehouse3 += item.quantity;
        } else {
          product.mainWarehouse += item.quantity;
        }
        
        updateProduct(product);
      }
    });
    
    // Actualizar estado de la factura asociada
    updateInvoiceStatusByOrderId(orderId, 'cancelada');
  }
  
  return orders[index];
};

// Función para inicializar los datos de facturas
export const getInvoices = (): Invoice[] => {
  const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
  if (storedInvoices) {
    return JSON.parse(storedInvoices);
  }
  
  return [];
};

// Función para guardar las facturas
export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
};

// Función para generar un nuevo número de factura
const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const lastInvoiceNumber = invoices.length > 0 
    ? parseInt(invoices[invoices.length - 1].invoiceNumber.replace('INV-', '')) 
    : 0;
  
  return `INV-${String(lastInvoiceNumber + 1).padStart(3, '0')}`;
};

// Función para crear una factura a partir de un pedido
export const createInvoiceFromOrder = (order: Order): Invoice => {
  const invoices = getInvoices();
  
  // Calcular subtotal y total con impuestos
  const subtotal = order.total;
  const tax = subtotal * 0.19; // IVA del 19%
  const total = subtotal + tax;
  
  // Generar un nuevo ID
  const newId = invoices.length > 0 
    ? Math.max(...invoices.map(i => i.id)) + 1 
    : 1;
  
  // Crear la nueva factura
  const newInvoice: Invoice = {
    id: newId,
    invoiceNumber: generateInvoiceNumber(),
    orderNumber: order.orderNumber,
    orderId: order.id,
    date: new Date().toISOString().split('T')[0],
    customerName: order.customer,
    customerAddress: order.address,
    items: order.items,
    subtotal,
    tax,
    total,
    status: 'pendiente'
  };
  
  // Agregar al listado y guardar
  invoices.push(newInvoice);
  saveInvoices(invoices);
  
  return newInvoice;
};

// Función para actualizar el estado de una factura por ID de pedido
export const updateInvoiceStatusByOrderId = (
  orderId: number, 
  status: 'pendiente' | 'pagada' | 'cancelada'
): Invoice | null => {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.orderId === orderId);
  
  if (index === -1) {
    return null;
  }
  
  // Actualizar el estado de la factura
  invoices[index] = {
    ...invoices[index],
    status
  };
  
  saveInvoices(invoices);
  return invoices[index];
};

// Hook para usar el servicio de pedidos con toast notifications
export const useOrderService = () => {
  const { toast } = useToast();
  
  return {
    getCustomers,
    addCustomer,
    getOrders,
    
    createOrder: (orderData: { customerId: number; items: OrderItem[], warehouseSource?: string }) => {
      try {
        const newOrder = createOrder(orderData);
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
    
    updateOrderStatus: (
      orderId: number, 
      status: 'pendiente' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado',
      deliveryPersonId?: number,
      deliveryPersonName?: string
    ) => {
      try {
        const updatedOrder = updateOrderStatus(orderId, status, deliveryPersonId, deliveryPersonName);
        
        // Mensajes personalizados según el estado
        let statusMessage = '';
        switch (status) {
          case 'preparacion':
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
    
    // Función para marcar una factura como pagada
    payInvoice: (invoiceId: number) => {
      try {
        const invoices = getInvoices();
        const index = invoices.findIndex(i => i.id === invoiceId);
        
        if (index === -1) {
          throw new Error(`Factura con ID ${invoiceId} no encontrada`);
        }
        
        invoices[index].status = 'pagada';
        saveInvoices(invoices);
        
        toast({
          title: "Factura pagada",
          description: `La factura #${invoices[index].invoiceNumber} ha sido marcada como pagada.`
        });
        
        return invoices[index];
      } catch (error: any) {
        toast({
          title: "Error al pagar la factura",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },

    // Función para generar PDF de factura
    generateInvoicePDF: (invoiceId: number) => {
      try {
        const invoices = getInvoices();
        const invoice = invoices.find(i => i.id === invoiceId);
        
        if (!invoice) {
          throw new Error(`Factura con ID ${invoiceId} no encontrada`);
        }
        
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

    // Función para imprimir factura
    printInvoice: (invoiceId: number) => {
      try {
        const invoices = getInvoices();
        const invoice = invoices.find(i => i.id === invoiceId);
        
        if (!invoice) {
          throw new Error(`Factura con ID ${invoiceId} no encontrada`);
        }
        
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
