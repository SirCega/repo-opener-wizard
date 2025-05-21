import React, { useEffect, useState } from 'react';
import { Invoice } from '@/types/order-types';
import { useOrderService } from '@/hooks/useOrderService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/router';

const InvoicesPage: React.FC = () => {
  const { invoices, loading, error, loadInvoices, payInvoice } = useOrderService();
  const [displayedInvoices, setDisplayedInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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
      // Opcional: Mostrar un mensaje de éxito
      console.log('Invoice paid successfully');
    } else {
      // Opcional: Mostrar un mensaje de error
      console.error('Failed to pay invoice');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const filteredInvoices = invoices.filter(invoice =>
      invoice.customerName.toLowerCase().includes(event.target.value.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setDisplayedInvoices(filteredInvoices);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Invoices</h1>

      <input
        type="text"
        placeholder="Search invoices..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell align="right">Customer Name</TableCell>
              <TableCell align="right">Issue Date</TableCell>
              <TableCell align="right">Due Date</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedInvoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell align="right">{invoice.customerName}</TableCell>
                <TableCell align="right">{format(new Date(invoice.issue_date), 'PPP', { locale: es })}</TableCell>
                <TableCell align="right">{format(new Date(invoice.due_date), 'PPP', { locale: es })}</TableCell>
                <TableCell align="right">{invoice.total_amount}</TableCell>
                <TableCell align="right">{invoice.status}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="primary" onClick={() => handlePayInvoice(invoice.id)}>
                    Pay
                  </Button>
                  <Link href={`/invoices/${invoice.id}`} passHref>
                    <Button size="small" color="secondary">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default InvoicesPage;
