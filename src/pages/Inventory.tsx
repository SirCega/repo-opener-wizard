import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  PackageOpen,
  ArrowUpDown,
  Package,
  Plus,
  Pencil,
  BarChart3,
  ArrowLeftRight,
  Boxes,
  Box,
  Building2,
  Warehouse,
  Users,
  Home,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Product, TransferRequest, Warehouse as WarehouseType } from '@/types/inventory-types';
import { useInventoryService } from '@/hooks/useInventoryService';
import MovementHistory from '@/components/inventory/MovementHistory';

const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const { 
    products, 
    warehouses, 
    loading, 
    error, 
    loadProducts, 
    loadWarehouses,
    addProduct,
    transferProduct
  } = useInventoryService();
  
  const [addProductData, setAddProductData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    category: '',
    threshold: 0,
    box_qty: 0,
    warehouse_quantities: {},
    mainWarehouse: 0,
    warehouse1: 0,
    warehouse2: 0,
    warehouse3: 0
  });
  const [transferData, setTransferData] = useState<TransferRequest>({
    product_id: '',
    sourceWarehouseId: '',
    destinationWarehouseId: '',
    quantity: 0,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  const handleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedProducts = React.useMemo(() => {
    if (!sortColumn) return products;

    return [...products].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [products, sortColumn, sortDirection]);

  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddProductData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddProductData(prevData => ({
      ...prevData,
      [name]: Number(value),
    }));
  };

  const handleAddProduct = async () => {
    try {
      const success = await addProduct({
        ...addProductData,
        warehouse_quantities: {
          "w1": addProductData.mainWarehouse || 0,
          "w2": addProductData.warehouse2 || 0,
          "w3": addProductData.warehouse3 || 0
        }
      });
      
      if (success) {
        toast({
          title: "Producto agregado",
          description: "El producto ha sido agregado exitosamente."
        });
        
        setShowAddProductDialog(false);
        setAddProductData({
          name: '',
          sku: '',
          description: '',
          price: 0,
          category: '',
          threshold: 0,
          box_qty: 0,
          warehouse_quantities: {},
          mainWarehouse: 0,
          warehouse1: 0,
          warehouse2: 0,
          warehouse3: 0
        });
      }
    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto.",
        variant: "destructive"
      });
    }
  };

  const handleTransferInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransferData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTransferNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransferData(prevData => ({
      ...prevData,
      [name]: Number(value),
    }));
  };

  const handleTransferProduct = async () => {
    try {
      await transferProduct({
        product_id: transferData.product_id,
        sourceWarehouseId: transferData.sourceWarehouseId,
        destinationWarehouseId: transferData.destinationWarehouseId,
        quantity: transferData.quantity,
        notes: transferData.notes
      });
      
      toast({
        title: "Transferencia exitosa",
        description: "Productos transferidos correctamente entre bodegas."
      });
      
      setShowTransferDialog(false);
      setTransferData({
        product_id: '',
        sourceWarehouseId: '',
        destinationWarehouseId: '',
        quantity: 0,
        notes: ''
      });
    } catch (error) {
      console.error("Error en transferencia:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la transferencia de productos.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventario</h1>
        <p className="text-muted-foreground">
          Gestiona tus productos, stock y movimientos de inventario.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                Administra tus productos y su stock en las diferentes bodegas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <TabsList>
                <TabsTrigger value="products">Productos</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
                <TabsTrigger value="warehouses">Bodegas</TabsTrigger>
                <TabsTrigger value="reports">Reportes</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar producto..."
                    className="pl-8 md:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Producto</DialogTitle>
                      <DialogDescription>
                        Agrega un nuevo producto al inventario.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            value={addProductData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            type="text"
                            id="sku"
                            name="sku"
                            value={addProductData.sku}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Input
                          type="text"
                          id="description"
                          name="description"
                          value={addProductData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Precio</Label>
                          <Input
                            type="number"
                            id="price"
                            name="price"
                            value={addProductData.price}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoría</Label>
                          <Input
                            type="text"
                            id="category"
                            name="category"
                            value={addProductData.category}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="threshold">Umbral de Stock</Label>
                          <Input
                            type="number"
                            id="threshold"
                            name="threshold"
                            value={addProductData.threshold}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="box_qty">Cantidad por Caja</Label>
                          <Input
                            type="number"
                            id="box_qty"
                            name="box_qty"
                            value={addProductData.box_qty}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium">Stock por Bodega</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="mainWarehouse">Bodega Principal</Label>
                          <Input
                            type="number"
                            id="mainWarehouse"
                            name="mainWarehouse"
                            value={addProductData.mainWarehouse}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouse1">Bodega Norte</Label>
                          <Input
                            type="number"
                            id="warehouse1"
                            name="warehouse1"
                            value={addProductData.warehouse1}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouse2">Bodega Sur</Label>
                          <Input
                            type="number"
                            id="warehouse2"
                            name="warehouse2"
                            value={addProductData.warehouse2}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouse3">Bodega Occidente</Label>
                          <Input
                            type="number"
                            id="warehouse3"
                            name="warehouse3"
                            value={addProductData.warehouse3}
                            onChange={handleNumberInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setShowAddProductDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" onClick={handleAddProduct}>Agregar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="products" className="space-y-4">
              {loading && <p>Cargando productos...</p>}
              {error && <p className="text-red-500">Error: {error}</p>}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('name')}>
                        Nombre
                        {sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('sku')}>
                        SKU
                        {sortColumn === 'sku' && (sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('category')}>
                        Categoría
                        {sortColumn === 'category' && (sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />)}
                      </TableHead>
                      <TableHead onClick={() => handleSort('price')}>
                        Precio
                        {sortColumn === 'price' && (sortDirection === 'asc' ? <ChevronUp className="inline-block w-4 h-4 ml-1" /> : <ChevronDown className="inline-block w-4 h-4 ml-1" />)}
                      </TableHead>
                      <TableHead>
                        Stock Total
                      </TableHead>
                      <TableHead>
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {product.warehouse_quantities &&
                            Object.values(product.warehouse_quantities).reduce((acc, qty) => acc + qty, 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-start space-x-2">
                            <Button variant="outline" size="sm">
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                                  Transferir
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Transferir Producto</DialogTitle>
                                  <DialogDescription>
                                    Transfiere productos entre bodegas.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div>
                                    <Label htmlFor="product_id">Producto</Label>
                                    <Input
                                      type="text"
                                      id="product_id"
                                      name="product_id"
                                      value={product.id}
                                      readOnly
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="sourceWarehouseId">Bodega Origen</Label>
                                    <Input
                                      type="text"
                                      id="sourceWarehouseId"
                                      name="sourceWarehouseId"
                                      value={transferData.sourceWarehouseId}
                                      onChange={handleTransferInputChange}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="destinationWarehouseId">Bodega Destino</Label>
                                    <Input
                                      type="text"
                                      id="destinationWarehouseId"
                                      name="destinationWarehouseId"
                                      value={transferData.destinationWarehouseId}
                                      onChange={handleTransferInputChange}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="quantity">Cantidad</Label>
                                    <Input
                                      type="number"
                                      id="quantity"
                                      name="quantity"
                                      value={transferData.quantity}
                                      onChange={handleTransferNumberInputChange}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="notes">Notas</Label>
                                    <Input
                                      type="text"
                                      id="notes"
                                      name="notes"
                                      value={transferData.notes}
                                      onChange={handleTransferInputChange}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="secondary" onClick={() => setShowTransferDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button type="submit" onClick={handleTransferProduct}>Transferir</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <MovementHistory />
            </TabsContent>

            <TabsContent value="warehouses" className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id}>
                    <CardHeader>
                      <CardTitle>{warehouse.name}</CardTitle>
                      <CardDescription>{warehouse.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Tipo: {warehouse.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes de Inventario</CardTitle>
                  <CardDescription>
                    Genera reportes de inventario para analizar el stock y
                    movimientos de tus productos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Aquí podrás encontrar diferentes tipos de reportes para
                    analizar tu inventario.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
