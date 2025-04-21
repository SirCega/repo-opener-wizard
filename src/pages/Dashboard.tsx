
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Package, ShoppingCart, TrendingUp, Users, Truck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

const inventoryData = [
  { name: 'Whisky', bodegaMadre: 120, bodega1: 30, bodega2: 45, bodega3: 35 },
  { name: 'Aguardiente', bodegaMadre: 200, bodega1: 50, bodega2: 40, bodega3: 60 },
  { name: 'Ron', bodegaMadre: 150, bodega1: 25, bodega2: 35, bodega3: 40 },
  { name: 'Cerveza', bodegaMadre: 300, bodega1: 100, bodega2: 90, bodega3: 80 },
  { name: 'Vodka', bodegaMadre: 90, bodega1: 20, bodega2: 25, bodega3: 15 },
];

const lowStockItems = [
  { id: 1, name: 'Whisky Premium', stock: 8, threshold: 10, location: 'Bodega 2' },
  { id: 2, name: 'Ron Dorado', stock: 5, threshold: 12, location: 'Bodega 3' },
  { id: 3, name: 'Vodka Importado', stock: 3, threshold: 15, location: 'Bodega 1' },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
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
              <p className="text-2xl font-bold">124</p>
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
              <p className="text-2xl font-bold">28</p>
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
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">$24,500</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
              <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-red-100/50">
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="text-center py-2 px-4 border-b font-medium text-red-600">{item.stock}</td>
                    <td className="text-center py-2 px-4 border-b">{item.threshold}</td>
                    <td className="py-2 px-4 border-b">{item.location}</td>
                  </tr>
                ))}
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
                  <p className="text-sm font-medium">Nuevo pedido #12456</p>
                  <p className="text-xs text-muted-foreground">Hace 10 minutos - Cliente: María López</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Entrega completada #12445</p>
                  <p className="text-xs text-muted-foreground">Hace 48 minutos - Domiciliario: Juan Pérez</p>
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
