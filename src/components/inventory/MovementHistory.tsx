import React, { useState } from 'react';
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
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon, Plus } from "lucide-react";
import { Product, InventoryMovement, useInventoryService } from "@/services/inventory.service";

interface MovementHistoryProps {
  products: Product[];
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({ products }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [selectedWarehouse, setSelectedWarehouse] = useState<'mainWarehouse' | 'warehouse1' | 'warehouse2' | 'warehouse3'>('mainWarehouse');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const { addMovement, getMovements } = useInventoryService();
  const movements = getMovements();

  const warehouseNames = {
    mainWarehouse: 'Bodega Principal',
    warehouse1: 'Bodega 1',
    warehouse2: 'Bodega 2',
    warehouse3: 'Bodega 3'
  };

  const handleAddMovement = () => {
    if (!selectedProduct) {
      return;
    }

    addMovement(
      parseInt(selectedProduct),
      movementType,
      quantity,
      "Admin Principal",
      note,
      selectedWarehouse
    );

    setIsDialogOpen(false);
    setSelectedProduct("");
    setMovementType('entrada');
    setSelectedWarehouse('mainWarehouse');
    setQuantity(1);
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Historial de Movimientos</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
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
            {movements.length > 0 ? (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.timestamp), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center ${
                      movement.type === 'entrada' 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }`}>
                      {movement.type === 'entrada' ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{movement.quantity}</TableCell>
                  <TableCell>{warehouseNames[movement.warehouse]}</TableCell>
                  <TableCell>{movement.responsible}</TableCell>
                  <TableCell>{movement.note}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay movimientos registrados.
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
                    <SelectItem key={product.id} value={product.id.toString()}>
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
                onValueChange={(value: 'mainWarehouse' | 'warehouse1' | 'warehouse2' | 'warehouse3') => 
                  setSelectedWarehouse(value)
                }
              >
                <SelectTrigger id="warehouse">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainWarehouse">Bodega Principal</SelectItem>
                  <SelectItem value="warehouse1">Bodega 1</SelectItem>
                  <SelectItem value="warehouse2">Bodega 2</SelectItem>
                  <SelectItem value="warehouse3">Bodega 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMovement}>
              Registrar Movimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
