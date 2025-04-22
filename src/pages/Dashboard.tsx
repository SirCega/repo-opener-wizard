
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Package, ShoppingCart, TrendingUp, Users, Truck, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { getOrders, getInvoices } from '@/services/order.service';
import { getInventory } from '@/services/inventory.service';

// Mock data for charts
const salesData = [
  { month: 'Ene', valor: 4000 },
  { month: 'Feb', valor: 3000 },
  { month: 'Mar', valor: 2000 },
  { month: 'Abr', valor: 2780 },
  { month: 'May', valor: 1890 },
  { month: 'Jun', valor: 2390 },
  { month: 'Jul', valor: 3490 },
];

// Mock data for daily sales
const dailySalesData = [
  { hour: '6AM', valor: 120 },
  { hour: '8AM', valor: 280 },
  { hour: '10AM', valor: 450 },
  { hour: '12PM', valor: 670 },
  { hour: '2PM', valor: 890 },
  { hour: '4PM', valor: 1200 },
  { hour: '6PM', valor: 980 },
  { hour: '8PM', valor: 760 },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [periodView, setPeriodView] = useState<'day' | 'month'>('month');
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = () => {
      const ordersData = getOrders();
      const invoicesData = getInvoices();
      const inventoryData = getInventory();
      
      setOrders(ordersData);
      setInvoices(invoicesData);
      setInventory(inventoryData);
    };
    
    fetchData();
  }, []);
  
  // Calcular total de ventas del día
  const totalDailySales = dailySalesData.reduce((sum, item) => sum + item.valor, 0);
  
  // Function to handle view change
  const handleViewChange = (view: 'day' | 'month') => {
    setPeriodView(view);
    toast({
      title: `Vista cambiada a ventas por ${view === 'day' ? 'día' : 'mes'}`,
      description: "El gráfico ha sido actualizado con los nuevos datos."
    });
  };
  
  // Filter client orders and invoices
  const clientOrders = orders.filter(order => 
    user?.role === 'cliente' && user?.name === order.customer
  );
  
  const clientInvoices = invoices.filter(invoice => 
    user?.role === 'cliente' && user?.name === invoice.customerName
  );
  
  // Get low stock items
  const lowStockItems = inventory.filter(item => {
    const totalStock = item.mainWarehouse + item.warehouse1 + item.warehouse2 + item.warehouse3;
    return totalStock < item.threshold;
  });
  
  // Transform inventory data for the chart
  const inventoryChartData = inventory.slice(0, 5).map(item => ({
    name: item.name,
    bodegaMadre: item.mainWarehouse,
    bodega1: item.warehouse1,
    bodega2: item.warehouse2,
    bodega3: item.warehouse3
  }));
  
  // Client dashboard
  if (user?.role === 'cliente') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Cliente</h1>
          <p className="text-muted-foreground">
            Resumen de tus pedidos y facturas pendientes.
          </p>
        </div>
        
        {/* Cliente Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tus Pedidos</p>
                <p className="text-2xl font-bold">{clientOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Entrega</p>
                <p className="text-2xl font-bold">
                  {clientOrders.filter(o => o.status === 'enviado').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-amber-100 rounded-full">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facturas Pendientes</p>
                <p className="text-2xl font-bold">
                  {clientInvoices.filter(i => i.status === 'pendiente').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cliente Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Pedidos Recientes</CardTitle>
            <CardDescription>
              Estado de tus últimas compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Nº Pedido</th>
                    <th className="text-left py-2 px-4 border-b">Fecha</th>
                    <th className="text-center py-2 px-4 border-b">Total</th>
                    <th className="text-center py-2 px-4 border-b">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientOrders.length > 0 ? (
                    clientOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                        <td className="py-2 px-4 border-b">{order.date}</td>
                        <td className="text-center py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                        <td className="text-center py-2 px-4 border-b">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            order.status === 'entregado' ? 'bg-green-100 text-green-800' : 
                            order.status === 'enviado' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'preparacion' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'pendiente' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'entregado' ? 'Entregado' :
                             order.status === 'enviado' ? 'En camino' :
                             order.status === 'preparacion' ? 'Preparando' :
                             order.status === 'pendiente' ? 'Pendiente' :
                             'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No tienes pedidos realizados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Cliente Facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Facturas</CardTitle>
            <CardDescription>
              Listado de tus facturas pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Nº Factura</th>
                    <th className="text-left py-2 px-4 border-b">Fecha</th>
                    <th className="text-center py-2 px-4 border-b">Total</th>
                    <th className="text-center py-2 px-4 border-b">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientInvoices.length > 0 ? (
                    clientInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4 border-b">{invoice.invoiceNumber}</td>
                        <td className="py-2 px-4 border-b">{invoice.date}</td>
                        <td className="text-center py-2 px-4 border-b">${invoice.total.toFixed(2)}</td>
                        <td className="text-center py-2 px-4 border-b">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            invoice.status === 'pagada' ? 'bg-green-100 text-green-800' : 
                            invoice.status === 'pendiente' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status === 'pagada' ? 'Pagada' :
                             invoice.status === 'pendiente' ? 'Pendiente' :
                             'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No tienes facturas pendientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Bodeguero dashboard
  if (user?.role === 'bodeguero') {
    const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
    const preparingOrders = orders.filter(o => o.status === 'preparacion').length;
    const shippedOrders = orders.filter(o => o.status === 'enviado').length;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Bodeguero</h1>
          <p className="text-muted-foreground">
            Resumen de pedidos pendientes y en preparación.
          </p>
        </div>
        
        {/* Bodeguero Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-blue-100 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-amber-100 rounded-full">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Preparación</p>
                <p className="text-2xl font-bold">{preparingOrders}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold">{shippedOrders}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bodeguero Orders In Preparation */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos En Preparación</CardTitle>
            <CardDescription>
              Pedidos que requieren tu atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Nº Pedido</th>
                    <th className="text-left py-2 px-4 border-b">Cliente</th>
                    <th className="text-left py-2 px-4 border-b">Fecha</th>
                    <th className="text-center py-2 px-4 border-b">Productos</th>
                    <th className="text-center py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status === 'preparacion').length > 0 ? (
                    orders.filter(o => o.status === 'preparacion').map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                        <td className="py-2 px-4 border-b">{order.customer}</td>
                        <td className="py-2 px-4 border-b">{order.date}</td>
                        <td className="text-center py-2 px-4 border-b">{order.items.length}</td>
                        <td className="text-center py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">
                        No hay pedidos en preparación actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Low Stock Alert */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle>Alerta de Stock Bajo</CardTitle>
            </div>
            <CardDescription>Productos que requieren reabastecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Producto</th>
                    <th className="text-center py-2 px-4 border-b">Stock Actual</th>
                    <th className="text-center py-2 px-4 border-b">Mínimo</th>
                    <th className="text-center py-2 px-4 border-b">Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-red-100/50">
                        <td className="py-2 px-4 border-b">{item.name}</td>
                        <td className="text-center py-2 px-4 border-b font-medium text-red-600">
                          {item.mainWarehouse + item.warehouse1 + item.warehouse2 + item.warehouse3}
                        </td>
                        <td className="text-center py-2 px-4 border-b">{item.threshold}</td>
                        <td className="text-center py-2 px-4 border-b">Varias</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No hay productos con stock bajo actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Domiciliario dashboard
  if (user?.role === 'domiciliario') {
    // Filtrar pedidos asignados al domiciliario actual (simulamos con ID 1)
    const assignedOrders = orders.filter(order => order.deliveryPersonId === 1);
    const pendingDeliveries = assignedOrders.filter(o => o.status === 'enviado').length;
    const completedDeliveries = assignedOrders.filter(o => o.status === 'entregado').length;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Domiciliario</h1>
          <p className="text-muted-foreground">
            Resumen de entregas pendientes y completadas.
          </p>
        </div>
        
        {/* Domiciliario Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregas Pendientes</p>
                <p className="text-2xl font-bold">{pendingDeliveries}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entregas Completadas</p>
                <p className="text-2xl font-bold">{completedDeliveries}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Domiciliario Assigned Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Entregas Asignadas</CardTitle>
            <CardDescription>
              Entregas pendientes para hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Nº Pedido</th>
                    <th className="text-left py-2 px-4 border-b">Cliente</th>
                    <th className="text-left py-2 px-4 border-b">Dirección</th>
                    <th className="text-center py-2 px-4 border-b">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedOrders.filter(o => o.status === 'enviado').length > 0 ? (
                    assignedOrders.filter(o => o.status === 'enviado').map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                        <td className="py-2 px-4 border-b">{order.customer}</td>
                        <td className="py-2 px-4 border-b">{order.address}</td>
                        <td className="text-center py-2 px-4 border-b">
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            En camino
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No tienes entregas pendientes actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Domiciliario Completed Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Entregas Completadas</CardTitle>
            <CardDescription>
              Historial de entregas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">Nº Pedido</th>
                    <th className="text-left py-2 px-4 border-b">Cliente</th>
                    <th className="text-left py-2 px-4 border-b">Fecha</th>
                    <th className="text-center py-2 px-4 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedOrders.filter(o => o.status === 'entregado').length > 0 ? (
                    assignedOrders.filter(o => o.status === 'entregado').map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                        <td className="py-2 px-4 border-b">{order.customer}</td>
                        <td className="py-2 px-4 border-b">{order.date}</td>
                        <td className="text-center py-2 px-4 border-b">${order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No has completado ninguna entrega aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Admin/Oficinista dashboard (default view)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de operaciones y estadísticas del sistema de gestión de licores.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-full">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productos</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-green-100 rounded-full">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Pendientes</p>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pendiente').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entregas Hoy</p>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === 'enviado').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-2 bg-amber-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventas del Mes</p>
              <p className="text-2xl font-bold">
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Sales Stats */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Ventas del Día</CardTitle>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-sm rounded-md transition-colors ${periodView === 'day' ? 'bg-primary text-white' : 'bg-primary/20 hover:bg-primary/30'}`}
                onClick={() => handleViewChange('day')}
              >
                Día
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md transition-colors ${periodView === 'month' ? 'bg-primary text-white' : 'bg-primary/20 hover:bg-primary/30'}`}
                onClick={() => handleViewChange('month')}
              >
                Mes
              </button>
            </div>
          </div>
          <CardDescription>
            {periodView === 'day' 
              ? `Hoy: ${new Date().toLocaleDateString()} - Total: $${totalDailySales.toFixed(2)}` 
              : 'Tendencia de ventas durante el año actual'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {periodView === 'day' ? (
              <BarChart data={dailySalesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Bar dataKey="valor" name="Ventas" fill="hsl(var(--primary))" />
              </BarChart>
            ) : (
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Area type="monotone" dataKey="valor" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Tendencia de ventas durante el año actual</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Area type="monotone" dataKey="valor" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribución de Inventario</CardTitle>
            <CardDescription>Cantidad de productos en cada bodega</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bodegaMadre" name="Bodega Madre" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="bodega1" name="Bodega 1" stackId="a" fill="#8884d8" />
                <Bar dataKey="bodega2" name="Bodega 2" stackId="a" fill="#82ca9d" />
                <Bar dataKey="bodega3" name="Bodega 3" stackId="a" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Low Stock Alert */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <CardTitle>Alerta de Stock Bajo</CardTitle>
          </div>
          <CardDescription>Productos que requieren reabastecimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4 border-b">Producto</th>
                  <th className="text-center py-2 px-4 border-b">Stock Actual</th>
                  <th className="text-center py-2 px-4 border-b">Mínimo</th>
                  <th className="text-left py-2 px-4 border-b">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-red-100/50">
                      <td className="py-2 px-4 border-b">{item.name}</td>
                      <td className="text-center py-2 px-4 border-b font-medium text-red-600">
                        {item.mainWarehouse + item.warehouse1 + item.warehouse2 + item.warehouse3}
                      </td>
                      <td className="text-center py-2 px-4 border-b">{item.threshold}</td>
                      <td className="py-2 px-4 border-b">Varias</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No hay productos con stock bajo actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Nuevo pedido #{orders.length > 0 ? orders[0].orderNumber : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Hace 10 minutos - Cliente: {orders.length > 0 ? orders[0].customer : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Entrega completada #{orders.length > 1 ? orders[1].orderNumber : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Hace 48 minutos - Domiciliario: Luis Pérez</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Actualización de inventario</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora - Bodeguero: Carlos Rodríguez</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
