
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, FileDown, FileText, Printer, Download } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Invoice, getInvoices, useOrderService } from '@/services/order.service';
import { useToast } from '@/hooks/use-toast';

const Invoices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  const { toast } = useToast();
  const orderService = useOrderService();
  
  // Cargar facturas
  useEffect(() => {
    const loadInvoices = getInvoices();
    setInvoices(loadInvoices);
  }, []);
  
  // Filtrar facturas según búsqueda, estado y pestaña
  const filteredInvoices = invoices.filter(invoice => 
    (searchQuery === '' || 
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || invoice.status === statusFilter) &&
    (currentTab === 'all' || 
     (currentTab === 'pending' && invoice.status === 'pendiente') ||
     (currentTab === 'paid' && invoice.status === 'pagada') ||
     (currentTab === 'cancelled' && invoice.status === 'cancelada'))
  );
  
  // Ver detalles de una factura
  const viewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setIsViewInvoiceDialogOpen(true);
  };
  
  // Marcar factura como pagada
  const markAsPaid = (invoiceId: number) => {
    try {
      const updatedInvoice = orderService.payInvoice(invoiceId);
      
      // Actualizar la lista de facturas
      setInvoices(invoices.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
      setIsViewInvoiceDialogOpen(false);
    } catch (error: any) {
      console.error(error);
    }
  };
  
  // Descargar factura (simulado)
  const downloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Factura descargada",
      description: `La factura ${invoice.invoiceNumber} ha sido descargada.`
    });
  };
  
  // Imprimir factura (simulado)
  const printInvoice = () => {
    toast({
      title: "Imprimiendo factura",
      description: "La factura se ha enviado a la impresora."
    });
    setIsViewInvoiceDialogOpen(false);
  };
  
  // Obtener badge según estado
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>;
      case 'pagada':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pagada</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Estadísticas de facturas
  const pendingInvoices = invoices.filter(i => i.status === 'pendiente');
  const paidInvoices = invoices.filter(i => i.status === 'pagada');
  const cancelledInvoices = invoices.filter(i => i.status === 'cancelada');
  
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalInvoiced = totalPending + totalPaid;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facturas</h1>
        <p className="text-muted-foreground">
          Gestión de facturas generadas de pedidos.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Facturación Total</CardTitle>
            <CardDescription>Año {new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">${totalInvoiced.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <span className="font-medium">${totalPaid.toFixed(2)}</span>
                <span className="ml-1">cobrado</span>
              </span>
              <span className="mx-2">|</span>
              <span className="inline-flex items-center text-amber-600">
                <span className="font-medium">${totalPending.toFixed(2)}</span>
                <span className="ml-1">pendiente</span>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Facturas Pendientes</CardTitle>
            <CardDescription>Requieren pago</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{pendingInvoices.length}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => {
                setCurrentTab('pending');
                setStatusFilter('pendiente');
              }}
            >
              Ver facturas pendientes
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exportar Datos</CardTitle>
            <CardDescription>Reportes de facturación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Facturas del mes (.xlsx)
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Reporte de impuestos (.pdf)
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Facturas</CardTitle>
              <CardDescription>
                Consulta y administra las facturas generadas de los pedidos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="paid">Pagadas</TabsTrigger>
                <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar factura o cliente..."
                    className="pl-8 md:w-[250px]"
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
            </div>
            
            <TabsContent value="all" className="m-0">
              <InvoiceTable 
                invoices={filteredInvoices} 
                getStatusBadge={getStatusBadge} 
                viewInvoice={viewInvoice}
                downloadInvoice={downloadInvoice}
              />
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <InvoiceTable 
                invoices={filteredInvoices} 
                getStatusBadge={getStatusBadge} 
                viewInvoice={viewInvoice}
                downloadInvoice={downloadInvoice}
              />
            </TabsContent>
            
            <TabsContent value="paid" className="m-0">
              <InvoiceTable 
                invoices={filteredInvoices} 
                getStatusBadge={getStatusBadge} 
                viewInvoice={viewInvoice}
                downloadInvoice={downloadInvoice}
              />
            </TabsContent>
            
            <TabsContent value="cancelled" className="m-0">
              <InvoiceTable 
                invoices={filteredInvoices} 
                getStatusBadge={getStatusBadge} 
                viewInvoice={viewInvoice}
                downloadInvoice={downloadInvoice}
              />
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
      
      {/* Ver Factura Dialog */}
      <Dialog open={isViewInvoiceDialogOpen} onOpenChange={setIsViewInvoiceDialogOpen}>
        <DialogContent className="max-w-3xl">
          {currentInvoice && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Factura #{currentInvoice.invoiceNumber}
                  </DialogTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => downloadInvoice(currentInvoice)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={printInvoice}
                    >
                      <Printer className="mr-1 h-4 w-4" />
                      Imprimir
                    </Button>
                  </div>
                </div>
                <DialogDescription>
                  Fecha de emisión: {new Date(currentInvoice.date).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="bg-muted/20 p-4 rounded-md">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-sm font-semibold mb-1">Facturado a:</h3>
                      <p className="text-sm font-medium">{currentInvoice.customerName}</p>
                      <p className="text-sm text-muted-foreground">{currentInvoice.customerAddress}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-semibold mb-1">Detalles de la factura:</h3>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Nº Factura:</span>{" "}
                        <span className="font-medium">{currentInvoice.invoiceNumber}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Nº Pedido:</span>{" "}
                        <span className="font-medium">{currentInvoice.orderNumber}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Estado:</span>{" "}
                        {getStatusBadge(currentInvoice.status)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex flex-col space-y-2 items-end">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">${currentInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">IVA (19%):</span>
                      <span className="font-medium">${currentInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t font-semibold">
                      <span>Total:</span>
                      <span>${currentInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Gracias por su compra. Para cualquier consulta relacionada con esta factura, por favor contacte a nuestro departamento de facturación.</p>
                </div>
              </div>
              
              <DialogFooter>
                {currentInvoice.status === 'pendiente' && (
                  <Button 
                    variant="outline" 
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    onClick={() => markAsPaid(currentInvoice.id)}
                  >
                    Marcar como Pagada
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewInvoiceDialogOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para la tabla de facturas
interface InvoiceTableProps {
  invoices: Invoice[];
  getStatusBadge: (status: string) => React.ReactNode;
  viewInvoice: (invoice: Invoice) => void;
  downloadInvoice: (invoice: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ 
  invoices, 
  getStatusBadge, 
  viewInvoice,
  downloadInvoice
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Nº Factura</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Nº Pedido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">IVA</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{invoice.orderNumber}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">${invoice.tax.toFixed(2)}</TableCell>
                <TableCell className="text-right">${invoice.total.toFixed(2)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadInvoice(invoice)}
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => viewInvoice(invoice)}
                    >
                      Ver
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                No se encontraron facturas que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Invoices;
