import { useToast } from "@/hooks/use-toast";

// Tipos para los productos e inventario
export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  mainWarehouse: number;
  warehouse1: number;
  warehouse2: number;
  warehouse3: number;
  threshold: number;
  price: number;
  boxQty: number;
}

export interface TransferRequest {
  productId: number;
  sourceWarehouse: 'mainWarehouse' | 'warehouse1' | 'warehouse2' | 'warehouse3';
  destinationWarehouse: 'mainWarehouse' | 'warehouse1' | 'warehouse2' | 'warehouse3';
  quantity: number;
}

// Almacenamiento local para simular persistencia en el cliente
const STORAGE_KEY = 'likistock_inventory';

// Función para obtener el inventario del almacenamiento local
export const getInventory = (): Product[] => {
  const storedInventory = localStorage.getItem(STORAGE_KEY);
  if (storedInventory) {
    return JSON.parse(storedInventory);
  }
  
  // Si no hay datos almacenados, usar datos de ejemplo
  const defaultInventory = [
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
  
  // Guardar los datos por defecto en el localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInventory));
  return defaultInventory;
};

// Función para guardar el inventario en el almacenamiento local
export const saveInventory = (inventory: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
};

// Función para emitir evento de cambio
const emitInventoryChange = () => {
  window.dispatchEvent(new StorageEvent('storage', { key: 'likistock_inventory' }));
};

// Función para agregar un nuevo producto
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const inventory = getInventory();
  
  // Generar un nuevo ID
  const newId = inventory.length > 0 
    ? Math.max(...inventory.map(p => p.id)) + 1 
    : 1;
  
  // Crear el nuevo producto con ID
  const newProduct: Product = {
    ...product,
    id: newId
  };
  
  // Agregar al inventario y guardar
  inventory.push(newProduct);
  saveInventory(inventory);
  
  // Emitir evento de cambio
  emitInventoryChange();
  
  return newProduct;
};

// Función para actualizar un producto
export const updateProduct = (product: Product): Product => {
  const inventory = getInventory();
  const index = inventory.findIndex(p => p.id === product.id);
  
  if (index !== -1) {
    inventory[index] = product;
    saveInventory(inventory);
    // Emitir evento de cambio
    emitInventoryChange();
    return product;
  }
  
  throw new Error(`Producto con ID ${product.id} no encontrado`);
};

// Función para eliminar un producto
export const deleteProduct = (productId: number): boolean => {
  const inventory = getInventory();
  const newInventory = inventory.filter(p => p.id !== productId);
  
  if (newInventory.length < inventory.length) {
    saveInventory(newInventory);
    return true;
  }
  
  return false;
};

// Función para transferir productos entre bodegas
export const transferProduct = (request: TransferRequest): Product => {
  const inventory = getInventory();
  const product = inventory.find(p => p.id === request.productId);
  
  if (!product) {
    throw new Error(`Producto con ID ${request.productId} no encontrado`);
  }
  
  // Verificar que hay suficiente stock en la bodega de origen
  if (product[request.sourceWarehouse] < request.quantity) {
    throw new Error(`Stock insuficiente en la bodega de origen`);
  }
  
  // Realizar la transferencia
  const updatedProduct = { ...product };
  updatedProduct[request.sourceWarehouse] -= request.quantity;
  updatedProduct[request.destinationWarehouse] += request.quantity;
  
  // Actualizar el producto en el inventario
  return updateProduct(updatedProduct);
};

// Hook para usar el servicio de inventario con toast notifications
export const useInventoryService = () => {
  const { toast } = useToast();
  
  return {
    getInventory,
    
    addProduct: (product: Omit<Product, 'id'>) => {
      try {
        const newProduct = addProduct(product);
        toast({
          title: "Producto agregado",
          description: `${product.name} ha sido agregado al inventario.`
        });
        return newProduct;
      } catch (error: any) {
        toast({
          title: "Error al agregar producto",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    updateProduct: (product: Product) => {
      try {
        const updatedProduct = updateProduct(product);
        toast({
          title: "Producto actualizado",
          description: `${product.name} ha sido actualizado.`
        });
        return updatedProduct;
      } catch (error: any) {
        toast({
          title: "Error al actualizar producto",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    deleteProduct: (productId: number) => {
      try {
        const result = deleteProduct(productId);
        if (result) {
          toast({
            title: "Producto eliminado",
            description: "El producto ha sido eliminado del inventario."
          });
        } else {
          toast({
            title: "Error al eliminar producto",
            description: "No se encontró el producto especificado.",
            variant: "destructive"
          });
        }
        return result;
      } catch (error: any) {
        toast({
          title: "Error al eliminar producto",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    transferProduct: (request: TransferRequest) => {
      try {
        const product = transferProduct(request);
        toast({
          title: "Transferencia exitosa",
          description: `Se han transferido ${request.quantity} unidades de ${product.name}.`
        });
        return product;
      } catch (error: any) {
        toast({
          title: "Error en la transferencia",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    }
  };
};
