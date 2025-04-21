
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ArrowUpDown, Truck, MapPin, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock data for deliveries
const deliveriesData = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customer: "Juan Pérez",
    address: "Calle 123 #45-67, Bogotá",
    date: "2024-04-15",
    status: "pendiente",
    deliveryDriver: "",
    items: 3,
    total: 124.50,
    estimatedDelivery: "2024-04-16",
    phone: "301-555-1234"
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customer: "María López",
    address: "Avenida 45 #12-34, Medellín",
    date: "2024-04-14",
    status: "asignado",
    deliveryDriver: "Carlos Ruiz",
    items: 2,
    total: 78.20,
    estimatedDelivery: "2024-04-15",
    phone: "302-555-5678"
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customer: "Carlos Rodríguez",
    address: "Carrera 67 #89-12, Cali",
    date: "2024-04-13",
    status: "en_ruta",
    deliveryDriver: "Ana Castro",
    items: 5,
    total: 245.00,
    estimatedDelivery: "2024-04-14",
    phone: "303-555-9012"
  },
  {
    id: 4,
    orderNumber: "ORD-004",
    customer: "Ana Martínez",
    address: "Calle 34 #56-78, Barranquilla",
    date: "2024-04-10",
    status: "entregado",
    deliveryDriver: "Luis Torres",
    items: 1,
    total: 56.75,
    estimatedDelivery: "2024-04-11",
    phone: "304-555-3456"
  },
  {
    id: 5,
    orderNumber: "ORD-005",
    customer: "Pedro Sánchez",
    address: "Avenida 78 #90-12, Bucaramanga",
    date: "2024-04-08",
    status: "cancelado",
    deliveryDriver: "Luis Torres",
    items: 4,
    total: 189.30,
    estimatedDelivery: "2024-04-09",
    phone: "305-555-7890"
  },
  {
    id: 6,
    orderNumber: "ORD-006",
    customer: "Sofía Gutiérrez",
    address: "Carrera 23 #45-67, Cartagena",
    date: "2024-04-05",
    status: "entregado",
    deliveryDriver: "Ana Castro",
    items: 3,
    total: 120.00,
    estimatedDelivery: "2024-04-06",
    phone: "306-555-1234"
  },
  {
    id: 7,
    orderNumber: "ORD-008",
    customer: "Carmen Díaz",
    address: "Avenida 12 #34-56, Pereira",
    date: "2024-04-01",
    status: "entregado",
    deliveryDriver: "Carlos Ruiz",
    items: 6,
    total: 345.25,
    estimatedDelivery: "2024-04-02",
    phone: "308-555-9012"
  }
];

// Mock data for delivery drivers
const driversData = [
  { id: 1, name: "Carlos Ruiz", available: true, deliveries: 24, successRate: 98 },
  { id: 2, name: "Ana Castro", available: true, deliveries: 32, successRate: 95 },
  { id: 3, name: "Luis Torres", available: false, deliveries: 18, successRate: 92 },
  { id: 4, name: "Elena Vargas", available: true, deliveries: 15, successRate: 97 },
];

const Deliveries: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isViewDeliveryDialogOpen, setIsViewDeliveryDialogOpen] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState<typeof deliveriesData[0] | null>(null);
  const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const { toast } = useToast();
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const filteredDeliveries = deliveriesData
    .filter(delivery => 
      (searchQuery === '' || 
        delivery.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
        delivery.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || delivery.status === statusFilter)
    )
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  const pendingDeliveries = deliveriesData.filter(d => d.status === 'pendiente');
  const inProgressDeliveries = deliveriesData.filter(d => d.status === 'asignado' || d.status === 'en_ruta');
  const completedDeliveries = deliveriesData.filter(d => d.status === 'entregado');
  
  const viewDelivery = (delivery: typeof deliveriesData[0]) => {
    setCurrentDelivery(delivery);
    setIsViewDeliveryDialogOpen(true);
  };

  const openAssignDriverDialog = (delivery: typeof deliveriesData[0]) => {
    setCurrentDelivery(delivery);
    setSelectedDriver('');
    setIsAssignDriverDialogOpen(true);
  };

  const handleAssignDriver = () => {
    if (currentDelivery && selectedDriver) {
      // Here you would normally update the delivery in your API
      toast({
        title: "Domiciliario asignado",
        description: `${driversData.find(d => d.id === parseInt(selectedDriver))?.name} ha sido asignado al pedido ${currentDelivery.orderNumber}`
      });
      setIsAssignDriverDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Por favor seleccione un domiciliario",
        variant: "destructive"
      });
    }
  };

  const updateDeliveryStatus = (status: string) => {
    if (currentDelivery) {
      // Here you would normally update the delivery in your API
      toast({
        title: "Estado actualizado",
        description: `La entrega ${currentDelivery.orderNumber} ha sido actualizada a "${
          status === 'entregado' ? 'Entregado' : 
          status === 'en_ruta' ? 'En Ruta' : 
          status === 'asignado' ? 'Asignado' : 
          status === 'cancelado' ? 'Cancelado' : 
          'Pendiente'
        }"`
      });
      setIsViewDeliveryDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Pendiente</Badge>;
      case 'asignado':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Asignado</Badge>;
      case 'en_ruta':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">En Ruta</Badge>;
      case 'entregado':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Entregado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Entregas</h1>
        <p className="text-muted-foreground">
          Gestión y seguimiento de entregas a domicilio.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumen de Entregas</CardTitle>
            <CardDescription>Última actualización: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendientes</span>
                <span className="font-medium">{pendingDeliveries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">En Proceso</span>
                <span className="font-medium">{inProgressDeliveries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completadas (hoy)</span>
                <span className="font-medium">{
                  completedDeliveries.filter(d => 
                    new Date(d.date).toDateString() === new Date().toDateString()
                  ).length
                }</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Canceladas</span>
                <span className="font-medium">{deliveriesData.filter(d => d.status === 'cancelado').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Domiciliarios Disponibles</CardTitle>
            <CardDescription>Estado actual de los domiciliarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {driversData.map(driver => (
                <div key={driver.id} className="flex items-start space-x-4 p-3 border rounded-md">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{driver.name}</h3>
                      {driver.available ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Disponible</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En Ruta</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex justify-between mt-1">
                      <span>Entregas: {driver.deliveries}</span>
                      <span>Éxito: {driver.successRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Entregas</CardTitle>
          <CardDescription>
            Administra y da seguimiento a las entregas de pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="inProgress">En Proceso</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar entrega..."
                    className="pl-8 md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Estado" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="asignado">Asignado</SelectItem>
                    <SelectItem value="en_ruta">En Ruta</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('orderNumber')}>
                          N° Pedido
                          {sortField === 'orderNumber' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('customer')}>
                          Cliente
                          {sortField === 'customer' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('date')}>
                          Fecha
                          {sortField === 'date' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Domiciliario</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.length > 0 ? (
                      filteredDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={delivery.address}>
                            {delivery.address}
                          </TableCell>
                          <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {delivery.deliveryDriver || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(delivery.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => viewDelivery(delivery)}
                              >
                                Ver Detalles
                              </Button>
                              {delivery.status === 'pendiente' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                  onClick={() => openAssignDriverDialog(delivery)}
                                >
                                  Asignar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No se encontraron entregas que coincidan con la búsqueda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">N° Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDeliveries.length > 0 ? (
                      pendingDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={delivery.address}>
                            {delivery.address}
                          </TableCell>
                          <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">${delivery.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewDelivery(delivery)}
                              >
                                Ver Detalles
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                onClick={() => openAssignDriverDialog(delivery)}
                              >
                                Asignar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No hay entregas pendientes en este momento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="inProgress" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">N° Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Domiciliario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inProgressDeliveries.length > 0 ? (
                      inProgressDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={delivery.address}>
                            {delivery.address}
                          </TableCell>
                          <TableCell>{delivery.deliveryDriver}</TableCell>
                          <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewDelivery(delivery)}
                              >
                                Ver Detalles
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No hay entregas en proceso en este momento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">N° Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha Entrega</TableHead>
                      <TableHead>Domiciliario</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedDeliveries.length > 0 ? (
                      completedDeliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">{delivery.orderNumber}</TableCell>
                          <TableCell>{delivery.customer}</TableCell>
                          <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                          <TableCell>{delivery.deliveryDriver}</TableCell>
                          <TableCell className="text-right">${delivery.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewDelivery(delivery)}
                              >
                                Ver Detalles
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No hay entregas completadas en este momento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* View Delivery Dialog */}
      <Dialog open={isViewDeliveryDialogOpen} onOpenChange={setIsViewDeliveryDialogOpen}>
        <DialogContent className="max-w-2xl">
          {currentDelivery && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Detalles de Entrega #{currentDelivery.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Fecha del pedido: {new Date(currentDelivery.date).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Cliente</h3>
                    <p className="text-sm">{currentDelivery.customer}</p>
                    <p className="text-sm text-muted-foreground">{currentDelivery.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Estado</h3>
                    <div>{getStatusBadge(currentDelivery.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium mb-1">Dirección de Entrega</h3>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                      <p className="text-sm">{currentDelivery.address}</p>
                    </div>
                  </div>
                  {currentDelivery.deliveryDriver && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium mb-1">Domiciliario</h3>
                      <p className="text-sm">{currentDelivery.deliveryDriver}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium mb-1">Total del Pedido</h3>
                    <p className="text-sm font-semibold">${currentDelivery.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Entrega Estimada</h3>
                    <p className="text-sm">{new Date(currentDelivery.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Productos</h3>
                  <div className="border rounded-md p-3">
                    <p className="text-sm">{currentDelivery.items} productos en este pedido</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {currentDelivery.status === 'pendiente' && (
                  <Button 
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                    onClick={() => openAssignDriverDialog(currentDelivery)}
                  >
                    Asignar Domiciliario
                  </Button>
                )}
                {currentDelivery.status === 'asignado' && (
                  <Button 
                    variant="outline" 
                    className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                    onClick={() => updateDeliveryStatus('en_ruta')}
                  >
                    Marcar En Ruta
                  </Button>
                )}
                {currentDelivery.status === 'en_ruta' && (
                  <Button 
                    variant="outline" 
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    onClick={() => updateDeliveryStatus('entregado')}
                  >
                    Marcar como Entregado
                  </Button>
                )}
                {(currentDelivery.status === 'pendiente' || currentDelivery.status === 'asignado' || currentDelivery.status === 'en_ruta') && (
                  <Button 
                    variant="outline" 
                    className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                    onClick={() => updateDeliveryStatus('cancelado')}
                  >
                    Cancelar Entrega
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDeliveryDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={isAssignDriverDialogOpen} onOpenChange={setIsAssignDriverDialogOpen}>
        <DialogContent>
          {currentDelivery && (
            <>
              <DialogHeader>
                <DialogTitle>Asignar Domiciliario</DialogTitle>
                <DialogDescription>
                  Seleccione un domiciliario para el pedido {currentDelivery.orderNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Domiciliarios Disponibles</h3>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un domiciliario" />
                    </SelectTrigger>
                    <SelectContent>
                      {driversData
                        .filter(driver => driver.available)
                        .map(driver => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name} - {driver.successRate}% éxito
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Detalles de la Entrega</h3>
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cliente:</span>
                      <span className="text-sm">{currentDelivery.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Dirección:</span>
                      <span className="text-sm max-w-[250px] text-right">{currentDelivery.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Teléfono:</span>
                      <span className="text-sm">{currentDelivery.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Productos:</span>
                      <span className="text-sm">{currentDelivery.items} items</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDriverDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAssignDriver}>Asignar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deliveries;
