
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Filter, Package, ArrowUpDown } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock data for products
const productsData = [
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

const Products: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<typeof productsData[0] | null>(null);
  const { toast } = useToast();
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: '',
    price: '',
    boxQty: '',
    threshold: '',
    mainWarehouse: ''
  });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const filteredProducts = productsData
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
  const categories = Array.from(new Set(productsData.map(item => item.category)));
  
  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setNewProduct({
      ...newProduct,
      category: value
    });
  };

  const handleCreateProduct = () => {
    // Validation
    if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.price) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally add the product to your database
    toast({
      title: "Producto creado",
      description: `${newProduct.name} ha sido agregado al inventario`
    });

    // Reset form and close dialog
    setNewProduct({
      sku: '',
      name: '',
      category: '',
      price: '',
      boxQty: '',
      threshold: '',
      mainWarehouse: ''
    });
    setIsNewProductDialogOpen(false);
  };

  const editProduct = (product: typeof productsData[0]) => {
    setCurrentProduct(product);
    setIsEditProductDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (currentProduct) {
      // Here you would normally update the product in your database
      toast({
        title: "Producto actualizado",
        description: `${currentProduct.name} ha sido actualizado correctamente`
      });
      setIsEditProductDialogOpen(false);
    }
  };

  const getStockStatus = (product: typeof productsData[0]) => {
    const lowStock = product.warehouse1 < product.threshold || 
                   product.warehouse2 < product.threshold || 
                   product.warehouse3 < product.threshold;
    
    if (lowStock) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Stock Bajo</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Productos</h1>
        <p className="text-muted-foreground">
          Catálogo de productos y gestión de inventario.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumen de Productos</CardTitle>
            <CardDescription>Total de productos: {productsData.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Por Categoría</h3>
                {categories.map(category => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <span className="font-medium">{productsData.filter(p => p.category === category).length}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-2">Estado de Inventario</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stock Normal</span>
                  <span className="font-medium">{productsData.filter(p => 
                    p.warehouse1 >= p.threshold && 
                    p.warehouse2 >= p.threshold && 
                    p.warehouse3 >= p.threshold
                  ).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stock Bajo</span>
                  <span className="font-medium text-red-600">{productsData.filter(p => 
                    p.warehouse1 < p.threshold || 
                    p.warehouse2 < p.threshold || 
                    p.warehouse3 < p.threshold
                  ).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Productos Destacados</CardTitle>
            <CardDescription>Los productos más populares y sus niveles de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsData.slice(0, 3).map(product => (
                <div key={product.id} className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Bodega Principal:</span>
                      <span className="font-medium">{product.mainWarehouse}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total en Sucursales:</span>
                      <span className="font-medium">{product.warehouse1 + product.warehouse2 + product.warehouse3}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>
                Administra tu inventario de productos
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                    <DialogDescription>
                      Ingrese los detalles del nuevo producto para agregarlo al inventario
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input 
                          id="sku" 
                          name="sku"
                          value={newProduct.sku}
                          onChange={handleNewProductChange}
                          placeholder="Ej: WP-010"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input 
                          id="name" 
                          name="name"
                          value={newProduct.name}
                          onChange={handleNewProductChange}
                          placeholder="Ej: Whisky Escocés"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select value={newProduct.category} onValueChange={handleCategoryChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                            <SelectItem value="nueva">+ Nueva Categoría</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Precio Unitario *</Label>
                        <Input 
                          id="price" 
                          name="price"
                          type="number"
                          value={newProduct.price}
                          onChange={handleNewProductChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="boxQty">Unid. por Caja</Label>
                        <Input 
                          id="boxQty" 
                          name="boxQty"
                          type="number"
                          value={newProduct.boxQty}
                          onChange={handleNewProductChange}
                          placeholder="Ej: 12"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="threshold">Umbral Mínimo</Label>
                        <Input 
                          id="threshold" 
                          name="threshold"
                          type="number"
                          value={newProduct.threshold}
                          onChange={handleNewProductChange}
                          placeholder="Ej: 10"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mainWarehouse">Stock Inicial</Label>
                        <Input 
                          id="mainWarehouse" 
                          name="mainWarehouse"
                          type="number"
                          value={newProduct.mainWarehouse}
                          onChange={handleNewProductChange}
                          placeholder="Ej: 100"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewProductDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateProduct}>Crear Producto</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar producto..."
                  className="pl-8 md:w-[300px]"
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
            </div>
          </div>
            
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
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('price')}>
                      Precio
                      {sortField === 'price' && (
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
                  <TableHead className="text-right">Stock Sucursales</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.mainWarehouse}</TableCell>
                      <TableCell className="text-right">
                        {product.warehouse1 + product.warehouse2 + product.warehouse3}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockStatus(product)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => editProduct(product)}
                          >
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No se encontraron productos que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
        <DialogContent>
          {currentProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogDescription>
                  Actualice la información del producto
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input 
                      id="edit-sku" 
                      value={currentProduct.sku}
                      onChange={(e) => setCurrentProduct({...currentProduct, sku: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input 
                      id="edit-name" 
                      value={currentProduct.name}
                      onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Categoría</Label>
                    <Select 
                      value={currentProduct.category} 
                      onValueChange={(value) => setCurrentProduct({...currentProduct, category: value})}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Precio Unitario</Label>
                    <Input 
                      id="edit-price" 
                      type="number"
                      value={currentProduct.price}
                      onChange={(e) => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-boxQty">Unid. por Caja</Label>
                    <Input 
                      id="edit-boxQty" 
                      type="number"
                      value={currentProduct.boxQty}
                      onChange={(e) => setCurrentProduct({...currentProduct, boxQty: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-threshold">Umbral Mínimo</Label>
                    <Input 
                      id="edit-threshold" 
                      type="number"
                      value={currentProduct.threshold}
                      onChange={(e) => setCurrentProduct({...currentProduct, threshold: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stock">Stock Central</Label>
                    <Input 
                      id="edit-stock" 
                      type="number"
                      value={currentProduct.mainWarehouse}
                      onChange={(e) => setCurrentProduct({...currentProduct, mainWarehouse: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditProductDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdateProduct}>Guardar Cambios</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
