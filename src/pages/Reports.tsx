
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Truck,
  FileDown,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data for sales over time
const salesData = [
  { name: 'Ene', ventas: 4000, pedidos: 240 },
  { name: 'Feb', ventas: 3000, pedidos: 198 },
  { name: 'Mar', ventas: 2000, pedidos: 120 },
  { name: 'Abr', ventas: 2780, pedidos: 167 },
  { name: 'May', ventas: 1890, pedidos: 98 },
  { name: 'Jun', ventas: 2390, pedidos: 114 },
  { name: 'Jul', ventas: 3490, pedidos: 221 },
  { name: 'Ago', ventas: 4000, pedidos: 250 },
  { name: 'Sep', ventas: 3200, pedidos: 210 },
  { name: 'Oct', ventas: 2800, pedidos: 190 },
  { name: 'Nov', ventas: 4500, pedidos: 320 },
  { name: 'Dic', ventas: 5000, pedidos: 390 }
];

// Mock data for product categories
const categoryData = [
  { name: 'Whisky', value: 35 },
  { name: 'Ron', value: 20 },
  { name: 'Aguardiente', value: 18 },
  { name: 'Cerveza', value: 12 },
  { name: 'Vodka', value: 8 },
  { name: 'Otros', value: 7 }
];

// Mock data for top selling products
const topProductsData = [
  { id: 1, name: 'Whisky Premium', sales: 287, revenue: 14350 },
  { id: 2, name: 'Aguardiente Antioqueño', sales: 210, revenue: 4200 },
  { id: 3, name: 'Ron Añejo', sales: 185, revenue: 5180 },
  { id: 4, name: 'Cerveza Artesanal', sales: 150, revenue: 450 },
  { id: 5, name: 'Vodka Importado', sales: 120, revenue: 3840 }
];

// Mock data for top customers
const topCustomersData = [
  { id: 1, name: 'Restaurante El Cielo', orders: 42, spent: 8500 },
  { id: 2, name: 'Bar La Cervecería', orders: 38, spent: 7200 },
  { id: 3, name: 'Hotel Continental', orders: 35, spent: 12500 },
  { id: 4, name: 'Discoteca Ático', orders: 30, spent: 9800 },
  { id: 5, name: 'Juan Pérez', orders: 25, spent: 4500 }
];

// Colors for pie chart
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [reportType, setReportType] = useState('sales');
  const { toast } = useToast();
  
  const handleDownloadReport = () => {
    toast({
      title: "Descarga iniciada",
      description: "El reporte se está descargando en formato Excel."
    });
    // In a real app, this would trigger an actual download
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reportes</h1>
        <p className="text-muted-foreground">
          Análisis de ventas, inventario y rendimiento del negocio.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
        <Card className="md:w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              Ventas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">$125,430</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">842</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-purple-500" />
              Productos Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">3,512</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">+15%</span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Truck className="mr-2 h-5 w-5 text-amber-500" />
              Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">780</div>
            <div className="flex items-center text-sm">
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-red-600 font-medium">-3%</span>
              <span className="text-muted-foreground ml-1">tiempo de entrega</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Análisis y Reportes</h2>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Reportes de Desempeño</CardTitle>
              <CardDescription>
                Análisis detallado de ventas, productos, clientes e inventario
              </CardDescription>
            </div>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="products">Productos</SelectItem>
                <SelectItem value="customers">Clientes</SelectItem>
                <SelectItem value="inventory">Inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="charts">
            <TabsList className="mb-4">
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="tables">Tablas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-6">
              {reportType === 'sales' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Tendencia de Ventas</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="ventas" stroke="#8884d8" activeDot={{ r: 8 }} name="Ventas ($)" />
                          <Line type="monotone" dataKey="pedidos" stroke="#82ca9d" name="Pedidos" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ventas por Categoría</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Comparación de Ventas Mensuales</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={salesData.slice(6, 12)} // Just showing last 6 months
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="ventas" name="Ventas ($)" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'products' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Productos Más Vendidos</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topProductsData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="sales" name="Unidades Vendidas" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ingresos por Producto</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topProductsData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" name="Ingresos ($)" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Distribución de Ventas por Categoría</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'customers' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Clientes con Mayor Gasto</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topCustomersData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="spent" name="Gasto Total ($)" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Pedidos por Cliente</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topCustomersData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="orders" name="Número de Pedidos" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Valor Promedio de Pedido</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topCustomersData.map(customer => ({
                              ...customer,
                              avgOrderValue: customer.spent / customer.orders
                            }))}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avgOrderValue" name="Valor Promedio ($)" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'inventory' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Niveles de Inventario por Categoría</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Whisky', stock: 235, threshold: 50 },
                            { name: 'Ron', stock: 180, threshold: 40 },
                            { name: 'Aguardiente', stock: 200, threshold: 50 },
                            { name: 'Cerveza', stock: 450, threshold: 100 },
                            { name: 'Vodka', stock: 65, threshold: 30 },
                            { name: 'Tequila', stock: 95, threshold: 20 }
                          ]}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="stock" name="Stock Actual" fill="#8884d8" />
                          <Bar dataKey="threshold" name="Umbral Mínimo" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Distribución de Inventario por Bodega</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Bodega Principal', value: 1250 },
                              { name: 'Bodega 1', value: 450 },
                              { name: 'Bodega 2', value: 380 },
                              { name: 'Bodega 3', value: 320 }
                            ]}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Unidades" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Productos con Stock Bajo</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Vodka Importado', stock: 15, threshold: 30, percent: 50 },
                              { name: 'Whisky Premium', stock: 10, threshold: 50, percent: 20 },
                              { name: 'Gin London Dry', stock: 8, threshold: 15, percent: 53 },
                              { name: 'Tequila Reposado', stock: 12, threshold: 20, percent: 60 },
                              { name: 'Brandy Reserva', stock: 6, threshold: 10, percent: 60 }
                            ]}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="stock" name="Stock Actual" fill="#ff8042" />
                            <Bar dataKey="threshold" name="Umbral Mínimo" fill="#0088fe" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="tables" className="space-y-6">
              {reportType === 'sales' && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ventas Mensuales</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mes</TableHead>
                            <TableHead className="text-right">Ventas ($)</TableHead>
                            <TableHead className="text-right">Pedidos</TableHead>
                            <TableHead className="text-right">Crecimiento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesData.map((month) => (
                            <TableRow key={month.name}>
                              <TableCell className="font-medium">{month.name}</TableCell>
                              <TableCell className="text-right">${month.ventas.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{month.pedidos}</TableCell>
                              <TableCell className="text-right">
                                {month.ventas > 3000 ? (
                                  <span className="text-green-600">↑ {Math.floor(Math.random() * 20) + 1}%</span>
                                ) : (
                                  <span className="text-red-600">↓ {Math.floor(Math.random() * 20) + 1}%</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'products' && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Productos Más Vendidos</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Vendidas</TableHead>
                            <TableHead className="text-right">Ingresos ($)</TableHead>
                            <TableHead className="text-right">Margen (%)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProductsData.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell className="text-right">{product.sales}</TableCell>
                              <TableCell className="text-right">${product.revenue.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Math.floor(30 + Math.random() * 20)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ventas por Categoría</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Porcentaje</TableHead>
                            <TableHead className="text-right">Ventas Totales ($)</TableHead>
                            <TableHead className="text-right">Crecimiento YTD</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryData.map((category) => (
                            <TableRow key={category.name}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell className="text-right">{category.value}%</TableCell>
                              <TableCell className="text-right">
                                ${Math.floor(category.value * 1000).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {Math.random() > 0.3 ? (
                                  <span className="text-green-600">↑ {Math.floor(Math.random() * 20) + 1}%</span>
                                ) : (
                                  <span className="text-red-600">↓ {Math.floor(Math.random() * 10) + 1}%</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'customers' && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mejores Clientes</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Pedidos</TableHead>
                            <TableHead className="text-right">Gasto Total ($)</TableHead>
                            <TableHead className="text-right">Valor Promedio ($)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topCustomersData.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">{customer.name}</TableCell>
                              <TableCell className="text-right">{customer.orders}</TableCell>
                              <TableCell className="text-right">${customer.spent.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                ${Math.round(customer.spent / customer.orders).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Segmentación de Clientes</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Segmento</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">% de Ventas</TableHead>
                            <TableHead className="text-right">Valor Promedio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Empresas</TableCell>
                            <TableCell className="text-right">28</TableCell>
                            <TableCell className="text-right">65%</TableCell>
                            <TableCell className="text-right">$3,500</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Clientes Frecuentes</TableCell>
                            <TableCell className="text-right">120</TableCell>
                            <TableCell className="text-right">25%</TableCell>
                            <TableCell className="text-right">$840</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ocasionales</TableCell>
                            <TableCell className="text-right">350</TableCell>
                            <TableCell className="text-right">10%</TableCell>
                            <TableCell className="text-right">$210</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'inventory' && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Estado de Inventario</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Stock Total</TableHead>
                            <TableHead className="text-right">Valor ($)</TableHead>
                            <TableHead className="text-right">Umbral</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Whisky</TableCell>
                            <TableCell className="text-right">235</TableCell>
                            <TableCell className="text-right">$11,750</TableCell>
                            <TableCell className="text-right">50</TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-600">Óptimo</span>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ron</TableCell>
                            <TableCell className="text-right">180</TableCell>
                            <TableCell className="text-right">$5,040</TableCell>
                            <TableCell className="text-right">40</TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-600">Óptimo</span>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Vodka</TableCell>
                            <TableCell className="text-right">15</TableCell>
                            <TableCell className="text-right">$480</TableCell>
                            <TableCell className="text-right">30</TableCell>
                            <TableCell className="text-right">
                              <span className="text-red-600">Stock Bajo</span>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Aguardiente</TableCell>
                            <TableCell className="text-right">200</TableCell>
                            <TableCell className="text-right">$4,000</TableCell>
                            <TableCell className="text-right">50</TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-600">Óptimo</span>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Tequila</TableCell>
                            <TableCell className="text-right">12</TableCell>
                            <TableCell className="text-right">$540</TableCell>
                            <TableCell className="text-right">20</TableCell>
                            <TableCell className="text-right">
                              <span className="text-red-600">Stock Bajo</span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Distribución por Bodega</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Bodega</TableHead>
                            <TableHead className="text-right">Unidades</TableHead>
                            <TableHead className="text-right">Valor ($)</TableHead>
                            <TableHead className="text-right">% del Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Bodega Principal</TableCell>
                            <TableCell className="text-right">1,250</TableCell>
                            <TableCell className="text-right">$45,200</TableCell>
                            <TableCell className="text-right">52%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Bodega 1</TableCell>
                            <TableCell className="text-right">450</TableCell>
                            <TableCell className="text-right">$16,300</TableCell>
                            <TableCell className="text-right">19%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Bodega 2</TableCell>
                            <TableCell className="text-right">380</TableCell>
                            <TableCell className="text-right">$14,200</TableCell>
                            <TableCell className="text-right">16%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Bodega 3</TableCell>
                            <TableCell className="text-right">320</TableCell>
                            <TableCell className="text-right">$12,100</TableCell>
                            <TableCell className="text-right">13%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Reportes Disponibles</CardTitle>
              <CardDescription>
                Descarga reportes detallados en diferentes formatos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center" onClick={handleDownloadReport}>
              <BarChart3 className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Reporte de Ventas</span>
              <span className="text-sm text-muted-foreground mt-1">Detalles de ventas por período</span>
              <FileDown className="h-4 w-4 mt-4" />
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center" onClick={handleDownloadReport}>
              <Package className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Inventario Completo</span>
              <span className="text-sm text-muted-foreground mt-1">Stock por producto y ubicación</span>
              <FileDown className="h-4 w-4 mt-4" />
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center" onClick={handleDownloadReport}>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <span className="font-medium">Análisis de Clientes</span>
              <span className="text-sm text-muted-foreground mt-1">Segmentación y comportamiento</span>
              <FileDown className="h-4 w-4 mt-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
