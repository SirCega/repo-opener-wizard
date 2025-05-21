
import React, { useEffect, useState } from 'react';
import { Invoice } from '@/types/order-types';
import { useOrderService } from '@/hooks/useOrderService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const InvoicesPage: React.FC = () => {
  const { invoices, loading, error, loadInvoices, payInvoice } = useOrderService();
  const [displayedInvoices, setDisplayedInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (invoices) {
      setDisplayedInvoices(invoices);
    }
  }, [invoices]);

  const handlePayInvoice = async (invoiceId: string) => {
    const success = await payInvoice(invoiceId);
    if (success) {
      console.log('Factura pagada con éxito');
    } else {
      console.error('Error al pagar la factura');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (invoices) {
      const filteredInvoices = invoices.filter(invoice =>
        invoice.customerName.toLowerCase().includes(value) ||
        invoice.invoice_number.toLowerCase().includes(value)
      );
      setDisplayedInvoices(filteredInvoices);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'pagada':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Pagada</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <p className="p-4">Cargando facturas...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Facturas</CardTitle>
          <CardDescription>
            Gestione todas las facturas de su negocio
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar facturas..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha de Emisión</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {invoice.status === 'pendiente' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-green-100 hover:bg-green-200 text-green-800"
                          onClick={() => handlePayInvoice(invoice.id)}
                        >
                          Pagar
                        </Button>
                      )}
                      <Link to={`/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;
