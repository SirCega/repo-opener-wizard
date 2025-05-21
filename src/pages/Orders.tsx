
import React, { useState, useEffect } from 'react';
import { useOrderService } from '@/hooks/useOrderService';
import { Order } from '@/types/order-types';
import { Link } from "react-router-dom";
import { format } from "date-fns";

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
import { Search } from "lucide-react";

const OrdersPage: React.FC = () => {
  const { orders, loading, error, getAllOrders } = useOrderService();
  const [searchText, setSearchText] = useState('');
  const [dataSource, setDataSource] = useState<Order[]>([]);

  useEffect(() => {
    if (orders) {
      setDataSource(orders);
    }
  }, [orders]);

  useEffect(() => {
    getAllOrders();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    
    if (orders) {
      const filtered = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(value) ||
        order.customer.toLowerCase().includes(value) ||
        order.address.toLowerCase().includes(value)
      );
      setDataSource(filtered);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'preparacion':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Preparación</Badge>;
      case 'enviado':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Enviado</Badge>;
      case 'entregado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Entregado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <p className="p-4">Cargando órdenes...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Órdenes</CardTitle>
          <CardDescription>
            Gestione todas las órdenes de su negocio
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar órdenes..."
              className="pl-8"
              value={searchText}
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSource.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.address}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">Ver</Button>
                      </Link>
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm" className="text-red-500">
                        Eliminar
                      </Button>
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

export default OrdersPage;
