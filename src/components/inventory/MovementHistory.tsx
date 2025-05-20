
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, ExternalLink, Plus } from "lucide-react";
import { 
  Product, 
  InventoryMovement, 
  useInventoryService, 
  Warehouse 
} from "@/services/inventory.service";
import { useAuth } from "@/hooks/useAuth";

interface MovementHistoryProps {
  products: Product[];
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({ products }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>("all");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addMovement, getMovements, getWarehouses } = useInventoryService();
  const { user } = useAuth();

  // Cargar bodegas y movimientos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const warehousesData = await getWarehouses();
        setWarehouses(warehousesData);
        
        // Establecer la primera bodega como predeterminada
        if (warehousesData.length > 0 && !selectedWarehouse) {
          setSelectedWarehouse(warehousesData[0].id);
        }
        
        const movementsData = await getMovements();
        setMovements(movementsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [getMovements, getWarehouses]);

  const handleAddMovement = async () => {
    if (!selectedProduct || !selectedWarehouse || !user) {
      return;
    }

    setIsLoading(true);
    try {
      await addMovement(
        selectedProduct,
        movementType,
        quantity,
        user.id,
        selectedWarehouse,
        note
      );

      // Recargar movimientos
      const updatedMovements = await getMovements();
      setMovements(updatedMovements);
      
      // Cerrar diálogo y resetear formulario
      setIsDialogOpen(false);
      setSelectedProduct("");
      setMovementType('entrada');
      setQuantity(1);
      setNote("");
    } catch (error) {
      console.error("Error al agregar movimiento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMovements = selectedWarehouseFilter === 'all' 
    ? movements 
    : movements.filter(movement => movement.warehouseId === selectedWarehouseFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Historial de Movimientos</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <Select value={selectedWarehouseFilter} onValueChange={(value) => setSelectedWarehouseFilter(value)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por bodega" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las bodegas</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Bodega</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {movement.createdAt ? format(parseISO(movement.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center ${
                      movement.type === 'entrada' 
                        ? 'text-green-600' 
                        : movement.type === 'salida'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}>
                      {movement.type === 'entrada' ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : movement.type === 'salida' ? (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-1" />
                      )}
                      {movement.type === 'entrada' ? 'Entrada' : 
                       movement.type === 'salida' ? 'Salida' : 'Transferencia'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{movement.quantity}</TableCell>
                  <TableCell>{movement.warehouseName}</TableCell>
                  <TableCell>{movement.responsibleName}</TableCell>
                  <TableCell>{movement.notes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay movimientos registrados para esta bodega.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>
            <DialogDescription>
              Registre una entrada o salida de productos del inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Producto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Movimiento</Label>
              <Select 
                value={movementType} 
                onValueChange={(value: 'entrada' | 'salida') => setMovementType(value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Nota</Label>
              <Input
                id="note"
                placeholder="Ej: Pedido #123"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="warehouse">Bodega</Label>
              <Select 
                value={selectedWarehouse} 
                onValueChange={(value) => setSelectedWarehouse(value)}
              >
                <SelectTrigger id="warehouse">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMovement} disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Registrar Movimiento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
