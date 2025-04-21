
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, Filter, Package, AlertTriangle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

// Mock data for inventory
const inventoryData = [
  {
    id: 1,
    sku: "WP-001",
    name: "Whisky Premium",
    category: "Whisky",
    mainWarehouse: 120,
    warehouse1: 25,
    warehouse2: 8,
    warehouse3: 15,
    threshold: 10,
    price: 50.00,
    boxQty: 12
  },
  {
    id: 2,
    sku: "AG-001",
    name: "Aguardiente Antioqueño",
    category: "Aguardiente",
    mainWarehouse: 200,
    warehouse1: 40,
    warehouse2: 35,
    warehouse3: 25,
    threshold: 20,
    price: 20.00,
    boxQty: 24
  },
  {
    id: 3,
    sku: "RN-001",
    name: "Ron Añejo",
    category: "Ron",
    mainWarehouse: 85,
    warehouse1: 12,
    warehouse2: 18,
    warehouse3: 14,
    threshold: 15,
    price: 28.00,
    boxQty: 12
  },
  {
    id: 4,
    sku: "VK-001",
    name: "Vodka Importado",
    category: "Vodka",
    mainWarehouse: 65,
    warehouse1: 3,
    warehouse2: 15,
    warehouse3: 10,
    threshold: 15,
    price: 32.00,
    boxQty: 6
  },
  {
    id: 5,
    sku: "TQ-001",
    name: "Tequila Reposado",
    category: "Tequila",
    mainWarehouse: 95,
    warehouse1: 18,
    warehouse2: 22,
    warehouse3: 16,
    threshold: 20,
    price: 45.00,
    boxQty: 12
  },
  {
    id: 6,
    sku: "BR-001",
    name: "Brandy Reserva",
    category: "Brandy",
    mainWarehouse: 60,
    warehouse1: 7,
    warehouse2: 12,
    warehouse3: 9,
    threshold: 10,
    price: 38.00,
    boxQty: 6
  },
  {
    id: 7,
    sku: "CR-001",
    name: "Cerveza Artesanal",
    category: "Cerveza",
    mainWarehouse: 350,
    warehouse1: 120,
    warehouse2: 95,
    warehouse3: 85,
    threshold: 50,
    price: 3.00,
    boxQty: 24
  },
  {
    id: 8,
    sku: "GN-001",
    name: "Gin London Dry",
    category: "Gin",
    mainWarehouse: 70,
    warehouse1: 12,
    warehouse2: 14,
    warehouse3: 11,
    threshold: 15,
    price: 35.00,
    boxQty: 12
  }
];

const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const handleSort = (field: string) => {
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
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Whisky</span>
                <span className="font-medium">{inventoryData.filter(i => i.category === 'Whisky').reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aguardiente</span>
                <span className="font-medium">{inventoryData.filter(i => i.category === 'Aguardiente').reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ron</span>
                <span className="font-medium">{inventoryData.filter(i => i.category === 'Ron').reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Otros</span>
                <span className="font-medium">{inventoryData.filter(i => !['Whisky', 'Aguardiente', 'Ron'].includes(i.category)).reduce((acc, item) => acc + item.mainWarehouse, 0)} u.</span>
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
          <CardTitle>Gestión de Inventario</CardTitle>
          <CardDescription>
            Consulta y administra el inventario en todas las bodegas
          </CardDescription>
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
                
                <Button variant="outline" className="flex-shrink-0">
                  <Package className="mr-2 h-4 w-4" />
                  Transferir Stock
                </Button>
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
                            <Button variant="outline" size="sm">
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
              <div className="p-6 text-center border rounded-md bg-muted/30">
                <h3 className="text-lg font-medium mb-2">Transferencia de Inventario</h3>
                <p className="text-muted-foreground mb-4">
                  Esta sección te permite transferir productos entre bodegas para optimizar la distribución.
                </p>
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Nueva Transferencia
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
