
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, Filter, Package, AlertTriangle, Plus, ArrowRightLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Product, TransferRequest, useInventoryService } from '@/services/inventory.service';

const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [inventoryData, setInventoryData] = useState<Product[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const { toast } = useToast();
  const inventoryService = useInventoryService();
  
  // Estado para el nuevo producto
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    sku: '',
    name: '',
    category: '',
    mainWarehouse: 0,
    warehouse1: 0,
    warehouse2: 0,
    warehouse3: 0,
    threshold: 0,
    price: 0,
    boxQty: 0
  });
  
  // Estado para la transferencia
  const [transfer, setTransfer] = useState<TransferRequest>({
    productId: 0,
    sourceWarehouse: 'mainWarehouse',
    destinationWarehouse: 'warehouse1',
    quantity: 1
  });
  
  // Cargar datos del inventario
  useEffect(() => {
    const data = inventoryService.getInventory();
    setInventoryData(data);
  }, []);
  
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const filteredInventory = inventoryData
    .filter(item => 
      (searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (currentCategory === 'all' || item.category === currentCategory)
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Get all unique categories
  const categories = Array.from(new Set(inventoryData.map(item => item.category)));
  
  // Calculate low stock items
  const lowStockItems = inventoryData.filter(item => {
    return (
      item.warehouse1 < item.threshold || 
      item.warehouse2 < item.threshold || 
      item.warehouse3 < item.threshold
    );
  });
  
  // Manejar el cambio de campos del nuevo producto
  const handleNewProductChange = (field: string, value: string | number) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'name' && field !== 'category' && field !== 'sku' 
        ? parseFloat(value) || 0
        : value
    }));
  };
  
  // Manejar la creación de un nuevo producto
  const handleCreateProduct = () => {
    try {
      // Validar campos requeridos
      if (!newProduct.sku || !newProduct.name || !newProduct.category) {
        toast({
          title: "Error",
          description: "SKU, nombre y categoría son campos obligatorios",
          variant: "destructive"
        });
        return;
      }
      
      // Crear producto
      const createdProduct = inventoryService.addProduct(newProduct);
      
      // Actualizar el estado local
      setInventoryData(prev => [...prev, createdProduct]);
      
      // Cerrar diálogo y limpiar formulario
      setIsAddProductDialogOpen(false);
      setNewProduct({
        sku: '',
        name: '',
        category: '',
        mainWarehouse: 0,
        warehouse1: 0,
        warehouse2: 0,
        warehouse3: 0,
        threshold: 0,
        price: 0,
        boxQty: 0
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  // Manejar el cambio de campos de la transferencia
  const handleTransferChange = (field: keyof TransferRequest, value: any) => {
    setTransfer(prev => ({
      ...prev,
      [field]: field === 'quantity' ? parseInt(value) || 0 : value
    }));
  };
  
  // Manejar la transferencia de producto
  const handleTransferProduct = () => {
    try {
      // Validar que se seleccionó un producto
      if (!transfer.productId) {
        toast({
          title: "Error",
          description: "Debe seleccionar un producto",
          variant: "destructive"
        });
        return;
      }
      
      // Validar que la cantidad es mayor que 0
      if (transfer.quantity <= 0) {
        toast({
          title: "Error",
          description: "La cantidad debe ser mayor que 0",
          variant: "destructive"
        });
        return;
      }
      
      // Validar que origen y destino son diferentes
      if (transfer.sourceWarehouse === transfer.destinationWarehouse) {
        toast({
          title: "Error",
          description: "Las bodegas de origen y destino deben ser diferentes",
          variant: "destructive"
        });
        return;
      }
      
      // Transferir producto
      const updatedProduct = inventoryService.transferProduct(transfer);
      
      // Actualizar el estado local
      setInventoryData(prev => prev.map(item => 
        item.id === updatedProduct.id ? updatedProduct : item
      ));
      
      // Cerrar diálogo y limpiar formulario
      setIsTransferDialogOpen(false);
      setTransfer({
        productId: 0,
        sourceWarehouse: 'mainWarehouse',
        destinationWarehouse: 'warehouse1',
        quantity: 1
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  // Mapped warehouse names for display
  const warehouseNames = {
    mainWarehouse: 'Bodega Principal',
    warehouse1: 'Bodega 1',
    warehouse2: 'Bodega 2',
    warehouse3: 'Bodega 3'
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventario</h1>
        <p className="text-muted-foreground">
          Gestión y monitoreo de inventario entre bodegas.
        </p>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Inventory Summary Cards */}
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Bodega Principal</CardTitle>
            <CardDescription>Inventario total: {inventoryData.reduce((acc, item) => acc + item.mainWarehouse, 0)} unidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.slice(0, 3).map(category => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm">{category}</span>
                  <span className="font-medium">{inventoryData.filter(i => i.category === category).reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm">Otros</span>
                <span className="font-medium">{inventoryData.filter(i => !categories.slice(0, 3).includes(i.category)).reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sucursales</CardTitle>
            <CardDescription>Inventario total en sucursales: {inventoryData.reduce((acc, item) => acc + item.warehouse1 + item.warehouse2 + item.warehouse3, 0)} unidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bodega 1</span>
                <span className="font-medium">{inventoryData.reduce((acc, item) => acc + item.warehouse1, 0)} u.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bodega 2</span>
                <span className="font-medium">{inventoryData.reduce((acc, item) => acc + item.warehouse2, 0)} u.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bodega 3</span>
                <span className="font-medium">{inventoryData.reduce((acc, item) => acc + item.warehouse3, 0)} u.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3 bg-amber-50/50 border-amber-200">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-lg">Stock Bajo</CardTitle>
            </div>
            <CardDescription>Productos con nivel bajo: {lowStockItems.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm truncate max-w-[180px]">{item.name}</span>
                  <div>
                    {item.warehouse1 < item.threshold && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 mr-1">B1</Badge>
                    )}
                    {item.warehouse2 < item.threshold && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 mr-1">B2</Badge>
                    )}
                    {item.warehouse3 < item.threshold && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">B3</Badge>
                    )}
                  </div>
                </div>
              ))}
              {lowStockItems.length > 3 && (
                <Button variant="link" className="p-0 h-auto text-amber-700">
                  Ver {lowStockItems.length - 3} productos más
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>
                Consulta y administra el inventario en todas las bodegas
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    <DialogDescription>
                      Ingrese los detalles del nuevo producto.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input 
                          id="sku" 
                          value={newProduct.sku} 
                          onChange={(e) => handleNewProductChange('sku', e.target.value)}
                          placeholder="Ej: WP-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Input 
                          id="category" 
                          value={newProduct.category} 
                          onChange={(e) => handleNewProductChange('category', e.target.value)}
                          placeholder="Ej: Whisky"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto</Label>
                      <Input 
                        id="name" 
                        value={newProduct.name} 
                        onChange={(e) => handleNewProductChange('name', e.target.value)}
                        placeholder="Ej: Whisky Premium"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio Unitario</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          value={newProduct.price.toString()} 
                          onChange={(e) => handleNewProductChange('price', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="boxQty">Unidades por Caja</Label>
                        <Input 
                          id="boxQty" 
                          type="number" 
                          value={newProduct.boxQty.toString()} 
                          onChange={(e) => handleNewProductChange('boxQty', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Umbral de Stock Mínimo</Label>
                      <Input 
                        id="threshold" 
                        type="number" 
                        value={newProduct.threshold.toString()} 
                        onChange={(e) => handleNewProductChange('threshold', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Cantidades Iniciales</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mainWarehouse" className="text-xs">Bodega Principal</Label>
                          <Input 
                            id="mainWarehouse" 
                            type="number" 
                            value={newProduct.mainWarehouse.toString()} 
                            onChange={(e) => handleNewProductChange('mainWarehouse', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="warehouse1" className="text-xs">Bodega 1</Label>
                          <Input 
                            id="warehouse1" 
                            type="number" 
                            value={newProduct.warehouse1.toString()} 
                            onChange={(e) => handleNewProductChange('warehouse1', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="warehouse2" className="text-xs">Bodega 2</Label>
                          <Input 
                            id="warehouse2" 
                            type="number" 
                            value={newProduct.warehouse2.toString()} 
                            onChange={(e) => handleNewProductChange('warehouse2', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="warehouse3" className="text-xs">Bodega 3</Label>
                          <Input 
                            id="warehouse3" 
                            type="number" 
                            value={newProduct.warehouse3.toString()} 
                            onChange={(e) => handleNewProductChange('warehouse3', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateProduct}>Guardar Producto</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="low">Stock Bajo</TabsTrigger>
                <TabsTrigger value="transfer">Transferencias</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar producto..."
                    className="pl-8 md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={currentCategory} onValueChange={setCurrentCategory}>
                  <SelectTrigger className="md:w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Categoría" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transferir Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Transferir Stock Entre Bodegas</DialogTitle>
                      <DialogDescription>
                        Seleccione el producto y las bodegas para realizar la transferencia.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="product">Producto</Label>
                        <Select 
                          value={transfer.productId.toString()} 
                          onValueChange={(val) => handleTransferChange('productId', parseInt(val))}
                        >
                          <SelectTrigger id="product">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryData.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="source">Bodega de Origen</Label>
                          <Select 
                            value={transfer.sourceWarehouse} 
                            onValueChange={(val) => handleTransferChange('sourceWarehouse', val as TransferRequest['sourceWarehouse'])}
                          >
                            <SelectTrigger id="source">
                              <SelectValue placeholder="Origen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mainWarehouse">Bodega Principal</SelectItem>
                              <SelectItem value="warehouse1">Bodega 1</SelectItem>
                              <SelectItem value="warehouse2">Bodega 2</SelectItem>
                              <SelectItem value="warehouse3">Bodega 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="destination">Bodega de Destino</Label>
                          <Select 
                            value={transfer.destinationWarehouse} 
                            onValueChange={(val) => handleTransferChange('destinationWarehouse', val as TransferRequest['destinationWarehouse'])}
                          >
                            <SelectTrigger id="destination">
                              <SelectValue placeholder="Destino" />
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad a Transferir</Label>
                        <Input 
                          id="quantity" 
                          type="number" 
                          min="1"
                          value={transfer.quantity.toString()} 
                          onChange={(e) => handleTransferChange('quantity', e.target.value)}
                        />
                      </div>
                      
                      {transfer.productId > 0 && (
                        <div className="rounded-md bg-muted p-3 text-sm">
                          <div className="font-medium">Disponibilidad actual:</div>
                          {Object.entries(warehouseNames).map(([key, name]) => {
                            const product = inventoryData.find(p => p.id === transfer.productId);
                            if (product) {
                              return (
                                <div key={key} className="flex justify-between mt-1">
                                  <span>{name}:</span>
                                  <span className="font-medium">
                                    {product[key as keyof typeof product]} unidades
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleTransferProduct}>Realizar Transferencia</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <TabsContent value="all" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('sku')}>
                          SKU
                          {sortField === 'sku' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('name')}>
                          Producto
                          {sortField === 'name' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('category')}>
                          Categoría
                          {sortField === 'category' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('mainWarehouse')}>
                          Bodega Principal
                          {sortField === 'mainWarehouse' && (
                            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Bodega 1</TableHead>
                      <TableHead className="text-right">Bodega 2</TableHead>
                      <TableHead className="text-right">Bodega 3</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.mainWarehouse}</TableCell>
                          <TableCell className={`text-right ${item.warehouse1 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse1}
                          </TableCell>
                          <TableCell className={`text-right ${item.warehouse2 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse2}
                          </TableCell>
                          <TableCell className={`text-right ${item.warehouse3 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse3}
                          </TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            {(item.warehouse1 < item.threshold || 
                              item.warehouse2 < item.threshold || 
                              item.warehouse3 < item.threshold) ? (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                Stock Bajo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                          No se encontraron productos que coincidan con la búsqueda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="low" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">SKU</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead className="text-right">Bodega 1</TableHead>
                      <TableHead className="text-right">Bodega 2</TableHead>
                      <TableHead className="text-right">Bodega 3</TableHead>
                      <TableHead className="text-right">Disponible en Central</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.sku}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.threshold}</TableCell>
                          <TableCell className={`text-right ${item.warehouse1 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse1}
                          </TableCell>
                          <TableCell className={`text-right ${item.warehouse2 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse2}
                          </TableCell>
                          <TableCell className={`text-right ${item.warehouse3 < item.threshold ? 'text-red-600 font-medium' : ''}`}>
                            {item.warehouse3}
                          </TableCell>
                          <TableCell className="text-right">{item.mainWarehouse}</TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Preparar los datos para la transferencia
                                let sourceWarehouse: TransferRequest['sourceWarehouse'] = 'mainWarehouse';
                                let destinationWarehouse: TransferRequest['destinationWarehouse'] = 'warehouse1';
                                
                                // Determinar la bodega que necesita reabastecimiento
                                if (item.warehouse1 < item.threshold) {
                                  destinationWarehouse = 'warehouse1';
                                } else if (item.warehouse2 < item.threshold) {
                                  destinationWarehouse = 'warehouse2';
                                } else if (item.warehouse3 < item.threshold) {
                                  destinationWarehouse = 'warehouse3';
                                }
                                
                                // Configurar y abrir el diálogo de transferencia
                                setTransfer({
                                  productId: item.id,
                                  sourceWarehouse,
                                  destinationWarehouse,
                                  quantity: item.threshold - Math.min(item.warehouse1, item.warehouse2, item.warehouse3)
                                });
                                setIsTransferDialogOpen(true);
                              }}
                            >
                              Reabastecer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                          No hay productos con nivel de stock bajo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="transfer" className="m-0">
              <div className="p-6 border rounded-md bg-muted/30">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium mb-2">Transferencia de Inventario</h3>
                  <p className="text-muted-foreground mb-4">
                    Esta sección te permite transferir productos entre bodegas para optimizar la distribución.
                  </p>
                  <Button onClick={() => setIsTransferDialogOpen(true)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Nueva Transferencia
                  </Button>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Historial de Transferencias Recientes</h4>
                  
                  <div className="rounded-md border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Ejemplo de historial de transferencias */}
                        <TableRow>
                          <TableCell>Whisky Premium</TableCell>
                          <TableCell>Bodega Principal</TableCell>
                          <TableCell>Bodega 2</TableCell>
                          <TableCell className="text-right">10</TableCell>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Aguardiente Antioqueño</TableCell>
                          <TableCell>Bodega Principal</TableCell>
                          <TableCell>Bodega 3</TableCell>
                          <TableCell className="text-right">15</TableCell>
                          <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
