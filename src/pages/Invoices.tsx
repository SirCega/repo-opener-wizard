
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, ArrowUpDown, FileDown, Printer, Eye, Calendar } from 'lucide-react';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock data for invoices
const invoicesData = [
  {
    id: 1,
    invoiceNumber: "F-001",
    orderNumber: "ORD-001",
    customer: "Juan Pérez",
    date: "2024-04-15",
    dueDate: "2024-05-15",
    total: 124.50,
    status: "pendiente",
    address: "Calle 123 #45-67, Bogotá",
    email: "juan@example.com",
    phone: "301-555-1234",
    items: [
      { id: 1, product: "Whisky Premium", quantity: 2, price: 50.00, total: 100.00 },
      { id: 2, product: "Cerveza Artesanal", quantity: 6, price: 3.00, total: 18.00 },
      { id: 3, product: "Ron Añejo", quantity: 1, price: 6.50, total: 6.50 }
    ]
  },
  {
    id: 2,
    invoiceNumber: "F-002",
    orderNumber: "ORD-002",
    customer: "María López",
    date: "2024-04-14",
    dueDate: "2024-05-14",
    total: 78.20,
    status: "pagada",
    address: "Avenida 45 #12-34, Medellín",
    email: "maria@example.com",
    phone: "302-555-5678",
    items: [
      { id: 1, product: "Vodka Importado", quantity: 1, price: 32.00, total: 32.00 },
      { id: 2, product: "Aguardiente Antioqueño", quantity: 2, price: 20.00, total: 40.00 },
      { id: 3, product: "Gaseosa", quantity: 2, price: 3.10, total: 6.20 }
    ]
  },
  {
    id: 3,
    invoiceNumber: "F-003",
    orderNumber: "ORD-003",
    customer: "Carlos Rodríguez",
    date: "2024-04-13",
    dueDate: "2024-05-13",
    total: 245.00,
    status: "pagada",
    address: "Carrera 67 #89-12, Cali",
    email: "carlos@example.com",
    phone: "303-555-9012",
    items: [
      { id: 1, product: "Whisky Premium", quantity: 3, price: 50.00, total: 150.00 },
      { id: 2, product: "Tequila Reposado", quantity: 2, price: 45.00, total: 90.00 },
      { id: 3, product: "Hielo", quantity: 1, price: 5.00, total: 5.00 }
    ]
  },
  {
    id: 4,
    invoiceNumber: "F-004",
    orderNumber: "ORD-004",
    customer: "Ana Martínez",
    date: "2024-04-10",
    dueDate: "2024-05-10",
    total: 56.75,
    status: "pagada",
    address: "Calle 34 #56-78, Barranquilla",
    email: "ana@example.com",
    phone: "304-555-3456",
    items: [
      { id: 1, product: "Gin London Dry", quantity: 1, price: 35.00, total: 35.00 },
      { id: 2, product: "Agua Tónica", quantity: 3, price: 2.25, total: 6.75 },
      { id: 3, product: "Limones", quantity: 5, price: 3.00, total: 15.00 }
    ]
  },
  {
    id: 5,
    invoiceNumber: "F-005",
    orderNumber: "ORD-005",
    customer: "Pedro Sánchez",
    date: "2024-04-08",
    dueDate: "2024-05-08",
    total: 189.30,
    status: "vencida",
    address: "Avenida 78 #90-12, Bucaramanga",
    email: "pedro@example.com",
    phone: "305-555-7890",
    items: [
      { id: 1, product: "Whisky Premium", quantity: 2, price: 50.00, total: 100.00 },
      { id: 2, product: "Ron Añejo", quantity: 2, price: 28.00, total: 56.00 },
      { id: 3, product: "Cerveza Artesanal", quantity: 12, price: 3.00, total: 36.00 }
    ]
  },
  {
    id: 6,
    invoiceNumber: "F-006",
    orderNumber: "ORD-006",
    customer: "Sofía Gutiérrez",
    date: "2024-04-05",
    dueDate: "2024-05-05",
    total: 120.00,
    status: "pagada",
    address: "Carrera 23 #45-67, Cartagena",
    email: "sofia@example.com",
    phone: "306-555-1234",
    items: [
      { id: 1, product: "Tequila Reposado", quantity: 2, price: 45.00, total: 90.00 },
      { id: 2, product: "Vodka Importado", quantity: 1, price: 30.00, total: 30.00 }
    ]
  },
  {
    id: 7,
    invoiceNumber: "F-007",
    orderNumber: "ORD-007",
    customer: "Luis Torres",
    date: "2024-04-03",
    dueDate: "2024-05-03",
    total: 67.80,
    status: "anulada",
    address: "Calle 56 #78-90, Santa Marta",
    email: "luis@example.com",
    phone: "307-555-5678",
    items: [
      { id: 1, product: "Aguardiente Antioqueño", quantity: 3, price: 20.00, total: 60.00 },
      { id: 2, product: "Gaseosa", quantity: 2, price: 3.90, total: 7.80 }
    ]
  },
  {
    id: 8,
    invoiceNumber: "F-008",
    orderNumber: "ORD-008",
    customer: "Carmen Díaz",
    date: "2024-04-01",
    dueDate: "2024-05-01",
    total: 345.25,
    status: "vencida",
    address: "Avenida 12 #34-56, Pereira",
    email: "carmen@example.com",
    phone: "308-555-9012",
    items: [
      { id: 1, product: "Whisky Premium", quantity: 4, price: 50.00, total: 200.00 },
      { id: 2, product: "Ron Añejo", quantity: 3, price: 28.00, total: 84.00 },
      { id: 3, product: "Vodka Importado", quantity: 2, price: 30.00, total: 60.00 }
    ]
  }
];

const Invoices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<typeof invoicesData[0] | null>(null);
  const { toast } = useToast();
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const filteredInvoices = invoicesData
    .filter(invoice => 
      (searchQuery === '' || 
        invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === 'all' || invoice.status === statusFilter) &&
      (dateRange === 'all' || (
        dateRange === 'last7' ? new Date(invoice.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
        dateRange === 'last30' ? new Date(invoice.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
        dateRange === 'last90' ? new Date(invoice.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) :
        true
      ))
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

  const pendingInvoices = invoicesData.filter(i => i.status === 'pendiente');
  const paidInvoices = invoicesData.filter(i => i.status === 'pagada');
  const overdueInvoices = invoicesData.filter(i => i.status === 'vencida');
  
  const viewInvoice = (invoice: typeof invoicesData[0]) => {
    setCurrentInvoice(invoice);
    setIsViewInvoiceDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: typeof invoicesData[0]) => {
    toast({
      title: "Descarga iniciada",
      description: `La factura ${invoice.invoiceNumber} se está descargando en formato PDF.`
    });
    // In a real app, this would trigger an actual download
  };

  const handlePrintInvoice = (invoice: typeof invoicesData[0]) => {
    toast({
      title: "Preparando impresión",
      description: `La factura ${invoice.invoiceNumber} se está preparando para imprimir.`
    });
    // In a real app, this would trigger the print dialog
  };

  const handleMarkAsPaid = (invoice: typeof invoicesData[0]) => {
    toast({
      title: "Estado actualizado",
      description: `La factura ${invoice.invoiceNumber} ha sido marcada como pagada.`
    });
    setIsViewInvoiceDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Pendiente</Badge>;
      case 'pagada':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagada</Badge>;
      case 'vencida':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Vencida</Badge>;
      case 'anulada':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Anulada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facturas</h1>
        <p className="text-muted-foreground">
          Gestión de facturación y seguimiento de pagos.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumen de Facturación</CardTitle>
            <CardDescription>Última actualización: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendientes</span>
                <span className="font-medium">{pendingInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pagadas</span>
                <span className="font-medium">{paidInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vencidas</span>
                <span className="font-medium text-red-600">{overdueInvoices.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total</span>
                <span className="font-medium">{invoicesData.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Estado Financiero</CardTitle>
            <CardDescription>Resumen de valores facturados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold">
                  ${invoicesData.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Pendiente de Cobro</p>
                <p className="text-2xl font-bold">
                  ${(pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0) + 
                     overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0)).toFixed(2)}
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Recaudado</p>
                <p className="text-2xl font-bold">
                  ${paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Facturas</CardTitle>
          <CardDescription>
            Administra y da seguimiento a las facturas generadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar factura..."
                  className="pl-8 md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="md:w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="last7">Últimos 7 días</SelectItem>
                  <SelectItem value="last30">Últimos 30 días</SelectItem>
                  <SelectItem value="last90">Últimos 90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button variant="outline" onClick={() => handleDownloadInvoice({ ...invoicesData[0], invoiceNumber: "Todas" })}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
            
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('invoiceNumber')}>
                      Nº Factura
                      {sortField === 'invoiceNumber' && (
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
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('date')}>
                      Fecha
                      {sortField === 'date' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('dueDate')}>
                      Vencimiento
                      {sortField === 'dueDate' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('total')}>
                      Total
                      {sortField === 'total' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => viewInvoice(invoice)}
                            title="Ver Factura"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Descargar PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handlePrintInvoice(invoice)}
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No se encontraron facturas que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
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

      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceDialogOpen} onOpenChange={setIsViewInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          {currentInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Factura #{currentInvoice.invoiceNumber}
                </DialogTitle>
                <DialogDescription>
                  Pedido: {currentInvoice.orderNumber} | Fecha: {new Date(currentInvoice.date).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Cliente</h3>
                    <p className="text-sm font-semibold">{currentInvoice.customer}</p>
                    <p className="text-sm">{currentInvoice.address}</p>
                    <p className="text-sm">{currentInvoice.email}</p>
                    <p className="text-sm">{currentInvoice.phone}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium mb-1">Detalles de Factura</h3>
                    <p className="text-sm"><span className="font-medium">Fecha:</span> {new Date(currentInvoice.date).toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Vencimiento:</span> {new Date(currentInvoice.dueDate).toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Estado:</span> {getStatusBadge(currentInvoice.status)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Productos</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unitario</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2}></TableCell>
                          <TableCell className="text-right font-medium">Subtotal</TableCell>
                          <TableCell className="text-right">
                            ${currentInvoice.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}></TableCell>
                          <TableCell className="text-right font-medium">IVA (19%)</TableCell>
                          <TableCell className="text-right">
                            ${(currentInvoice.items.reduce((sum, item) => sum + item.total, 0) * 0.19).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2}></TableCell>
                          <TableCell className="text-right font-bold">Total</TableCell>
                          <TableCell className="text-right font-bold">${currentInvoice.total.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Términos y Condiciones</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos los pagos deben realizarse dentro de los 30 días posteriores a la fecha de la factura.
                    Se aplicará un cargo por mora del 1.5% mensual a las facturas vencidas.
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {currentInvoice.status === 'pendiente' && (
                  <Button 
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    onClick={() => handleMarkAsPaid(currentInvoice)}
                  >
                    Marcar como Pagada
                  </Button>
                )}
                {currentInvoice.status === 'vencida' && (
                  <Button 
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    onClick={() => handleMarkAsPaid(currentInvoice)}
                  >
                    Registrar Pago
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => handlePrintInvoice(currentInvoice)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadInvoice(currentInvoice)}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewInvoiceDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
