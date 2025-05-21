
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOrderService } from '@/hooks/useOrderService';
import { Invoice } from '@/types/order-types';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [paidInvoices, setPaidInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const orderService = useOrderService();

  useEffect(() => {
    loadInvoices();
  }, []);
  
  const loadInvoices = async () => {
    try {
      setLoading(true);
      await orderService.loadInvoices();
      
      const data = orderService.invoices;
      
      const sorted = [...data].sort((a, b) => 
        new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      );
      
      setInvoices(sorted);
      setPendingInvoices(sorted.filter(inv => inv.status === 'pendiente'));
      setPaidInvoices(sorted.filter(inv => inv.status === 'pagada'));
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las facturas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await orderService.payInvoice(id);
      toast({
        title: 'Pago registrado',
        description: 'La factura ha sido marcada como pagada'
      });
      await loadInvoices();
    } catch (error) {
      console.error('Error paying invoice:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        variant: 'destructive'
      });
    }
  };
  
  const currentInvoices =
    currentTab === 'all'
      ? invoices
      : currentTab === 'pending'
      ? pendingInvoices
      : paidInvoices;

  const filteredInvoices = currentInvoices.filter(invoice => {
    if (searchTerm === '') return true;
    
    return (
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const calculateTotal = (invoice: Invoice) => {
    if (!invoice.items) return 0;
    return invoice.items.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const calculateTax = (invoice: Invoice) => {
    const total = calculateTotal(invoice);
    return total * 0.19;
  };

  const calculateGrandTotal = (invoice: Invoice) => {
    return calculateTotal(invoice) + calculateTax(invoice);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const [open, setOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleOpenDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facturas</h1>
        <p className="text-muted-foreground">
          Gestiona y visualiza las facturas de tus clientes.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>
            Visualiza y gestiona las facturas de tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" value={currentTab} onValueChange={setCurrentTab}>
            <div className="flex items-center justify-between space-y-2 md:space-y-0">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="paid">Pagadas</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar factura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="bg-muted">
                    <CardHeader>
                      <CardTitle>Factura #{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        Cliente: {invoice.customerName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>Fecha: {formatDate(invoice.issue_date)}</p>
                      <p>Total: ${invoice.total_amount.toFixed(2)}</p>
                      <Badge
                        variant="secondary"
                        className={
                          invoice.status === 'pagada'
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }
                      >
                        {invoice.status === 'pagada' ? 'Pagada' : 'Pendiente'}
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleOpenDialog(invoice)}>
                        Ver Detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredInvoices.filter(invoice => invoice.status === 'pendiente').map((invoice) => (
                  <Card key={invoice.id} className="bg-muted">
                    <CardHeader>
                      <CardTitle>Factura #{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        Cliente: {invoice.customerName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>Fecha: {formatDate(invoice.issue_date)}</p>
                      <p>Total: ${invoice.total_amount.toFixed(2)}</p>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500 text-white"
                      >
                        Pendiente
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleOpenDialog(invoice)}>
                        Ver Detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="paid" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredInvoices.filter(invoice => invoice.status === 'pagada').map((invoice) => (
                  <Card key={invoice.id} className="bg-muted">
                    <CardHeader>
                      <CardTitle>Factura #{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        Cliente: {invoice.customerName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>Fecha: {formatDate(invoice.issue_date)}</p>
                      <p>Total: ${invoice.total_amount.toFixed(2)}</p>
                      <Badge
                        variant="secondary"
                        className="bg-green-500 text-white"
                      >
                        Pagada
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleOpenDialog(invoice)}>
                        Ver Detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Factura</DialogTitle>
            <DialogDescription>
              Información detallada de la factura seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Factura #{selectedInvoice.invoice_number}
                  </h3>
                  <p>Fecha de Emisión: {formatDate(selectedInvoice.issue_date)}</p>
                  <p>Fecha de Vencimiento: {formatDate(selectedInvoice.due_date)}</p>
                  <p>Cliente: {selectedInvoice.customerName}</p>
                  <p>Dirección: {selectedInvoice.customerAddress}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Resumen de la Factura
                  </h3>
                  <p>Subtotal: ${selectedInvoice.subtotal.toFixed(2)}</p>
                  <p>Impuestos (19%): ${selectedInvoice.tax_amount.toFixed(2)}</p>
                  <p className="text-xl font-bold">
                    Total: ${selectedInvoice.total_amount.toFixed(2)}
                  </p>
                  <Badge
                    variant="secondary"
                    className={
                      selectedInvoice.status === 'pagada'
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }
                  >
                    {selectedInvoice.status === 'pagada' ? 'Pagada' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Artículos Facturados
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unitario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${item.unit_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseDialog}>
              Cerrar
            </Button>
            {selectedInvoice?.status === 'pendiente' && (
              <Button onClick={() => selectedInvoice && handlePay(selectedInvoice.id)}>
                Marcar como Pagada
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
