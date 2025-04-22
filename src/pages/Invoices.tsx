
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, FileDown, Receipt, Printer, Download } from 'lucide-react';
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
  DialogTrigger,
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
import { useOrderService, Invoice } from '@/services/order.service';
import { useAuth } from '@/hooks/useAuth';

const Invoices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const { toast } = useToast();
  const orderService = useOrderService();
  const { user } = useAuth();
  
  // Estado para los datos
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Cargar datos iniciales
  useEffect(() => {
    setInvoices(orderService.getInvoices());
  }, []);

  // Filtrar facturas según el rol del usuario
  const filteredInvoices = invoices.filter(invoice => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery === '' || 
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de estado
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Filtros según rol
    if (user?.role === 'cliente') {
      // Cliente solo ve sus propias facturas
      return matchesSearch && matchesStatus && invoice.customerName === user.name;
    } else {
      // Admin y oficinista ven todas las facturas
      return matchesSearch && matchesStatus;
    }
  });

  const viewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsInvoiceDialogOpen(true);
  };
  
  const payInvoice = (invoiceId: number) => {
    try {
      const updatedInvoice = orderService.payInvoice(invoiceId);
      setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
    } catch (error: any) {
      console.error(error);
    }
  };

  const printInvoice = (invoiceId: number) => {
    try {
      orderService.printInvoice(invoiceId);
    } catch (error: any) {
      console.error(error);
    }
  };

  const downloadInvoicePDF = (invoiceId: number) => {
    try {
      orderService.generateInvoicePDF(invoiceId);
    } catch (error: any) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Pendiente</Badge>;
      case 'pagada':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagada</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facturas</h1>
        <p className="text-muted-foreground">
          Gestión y consulta de facturas generadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Facturas</CardTitle>
              <CardDescription>
                Administra las facturas generadas a partir de pedidos
              </CardDescription>
            </div>
          </div>
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
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm" className="h-9">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          </div>
            
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nº Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.orderNumber}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewInvoice(invoice)}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hidden sm:flex" 
                            onClick={() => printInvoice(invoice.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hidden sm:flex" 
                            onClick={() => downloadInvoicePDF(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
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

      {/* Invoice Detail Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          {currentInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Factura #{currentInvoice.invoiceNumber}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => printInvoice(currentInvoice.id)}
                    >
                      <Printer className="h-4 w-4 mr-2" /> Imprimir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadInvoicePDF(currentInvoice.id)}
                    >
                      <Download className="h-4 w-4 mr-2" /> Descargar PDF
                    </Button>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Fecha: {new Date(currentInvoice.date).toLocaleDateString()}
                  &nbsp;|&nbsp;Estado: {currentInvoice.status.charAt(0).toUpperCase() + currentInvoice.status.slice(1)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Datos de Cliente</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Cliente:</span> {currentInvoice.customerName}</p>
                      <p><span className="font-medium">Dirección:</span> {currentInvoice.customerAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Datos de Facturación</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nº de Factura:</span> {currentInvoice.invoiceNumber}</p>
                      <p><span className="font-medium">Nº de Pedido:</span> {currentInvoice.orderNumber}</p>
                      <p><span className="font-medium">Fecha Emisión:</span> {new Date(currentInvoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Detalle de Productos</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentInvoice.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>${currentInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">IVA (19%):</span>
                    <span>${currentInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 text-lg font-bold">
                    <span>Total:</span>
                    <span>${currentInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {currentInvoice.status === 'pendiente' && (
                  <Button 
                    onClick={() => {
                      payInvoice(currentInvoice.id);
                      setIsInvoiceDialogOpen(false);
                    }}
                  >
                    Marcar como Pagada
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setIsInvoiceDialogOpen(false)}
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
