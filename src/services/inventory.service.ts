
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Tipos para los productos e inventario
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  boxQty: number;
  threshold: number;
  description?: string;
  imageUrl?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  warehouseName?: string; // Para mostrar en la UI
  productName?: string; // Para mostrar en la UI
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  address?: string;
}

export interface TransferRequest {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  responsibleId: string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName?: string;
  type: 'entrada' | 'salida' | 'transferencia';
  quantity: number;
  responsibleId: string;
  responsibleName?: string;
  warehouseId: string;
  warehouseName?: string;
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  notes?: string;
  createdAt: string;
}

// Función para obtener todas las bodegas
export const getWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*');

  if (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }

  return data.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name,
    type: warehouse.type,
    address: warehouse.address
  }));
};

// Función para obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data.map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    boxQty: product.box_qty,
    threshold: product.threshold,
    description: product.description,
    imageUrl: product.image_url
  }));
};

// Función para obtener el inventario de todas las bodegas
export const getInventory = async (): Promise<InventoryItem[]> => {
  // Traemos el inventario con información de productos y bodegas
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      id,
      product_id,
      warehouse_id,
      quantity,
      products(name),
      warehouses(name)
    `);

  if (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    productId: item.product_id,
    warehouseId: item.warehouse_id,
    quantity: item.quantity,
    productName: item.products?.name,
    warehouseName: item.warehouses?.name
  }));
};

// Función para obtener el inventario de un producto específico
export const getProductInventory = async (productId: string): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      id,
      product_id,
      warehouse_id,
      quantity,
      warehouses(name)
    `)
    .eq('product_id', productId);

  if (error) {
    console.error(`Error fetching inventory for product ${productId}:`, error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    productId: item.product_id,
    warehouseId: item.warehouse_id,
    quantity: item.quantity,
    warehouseName: item.warehouses?.name
  }));
};

// Función para agregar un nuevo producto
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      box_qty: product.boxQty,
      threshold: product.threshold,
      description: product.description,
      image_url: product.imageUrl
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding product:", error);
    throw error;
  }

  // Crear entradas de inventario inicial en 0 para todas las bodegas
  const warehouses = await getWarehouses();
  
  const inventoryItems = warehouses.map(warehouse => ({
    product_id: data.id,
    warehouse_id: warehouse.id,
    quantity: 0
  }));

  const { error: inventoryError } = await supabase
    .from('inventory')
    .insert(inventoryItems);

  if (inventoryError) {
    console.error("Error initializing inventory for new product:", inventoryError);
    throw inventoryError;
  }

  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category: data.category,
    price: Number(data.price),
    boxQty: data.box_qty,
    threshold: data.threshold,
    description: data.description,
    imageUrl: data.image_url
  };
};

// Función para actualizar un producto
export const updateProduct = async (product: Product): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      box_qty: product.boxQty,
      threshold: product.threshold,
      description: product.description,
      image_url: product.imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', product.id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product ${product.id}:`, error);
    throw error;
  }

  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category: data.category,
    price: Number(data.price),
    boxQty: data.box_qty,
    threshold: data.threshold,
    description: data.description,
    imageUrl: data.image_url
  };
};

// Función para eliminar un producto
export const deleteProduct = async (productId: string): Promise<boolean> => {
  // Primero eliminamos el inventario asociado
  const { error: inventoryError } = await supabase
    .from('inventory')
    .delete()
    .eq('product_id', productId);

  if (inventoryError) {
    console.error(`Error deleting inventory for product ${productId}:`, inventoryError);
    throw inventoryError;
  }

  // Luego eliminamos el producto
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }

  return true;
};

// Función para transferir productos entre bodegas
export const transferProduct = async (request: TransferRequest): Promise<boolean> => {
  // Verificar que hay suficiente stock en la bodega de origen
  const { data: sourceInventory, error: sourceError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', request.productId)
    .eq('warehouse_id', request.sourceWarehouseId)
    .single();

  if (sourceError) {
    console.error("Error checking source inventory:", sourceError);
    throw sourceError;
  }

  if (sourceInventory.quantity < request.quantity) {
    throw new Error(`Stock insuficiente en la bodega de origen. Disponible: ${sourceInventory.quantity}`);
  }

  // Iniciar transacción
  // Restar del inventario de origen
  const { error: updateSourceError } = await supabase
    .from('inventory')
    .update({
      quantity: sourceInventory.quantity - request.quantity,
      updated_at: new Date().toISOString()
    })
    .eq('product_id', request.productId)
    .eq('warehouse_id', request.sourceWarehouseId);

  if (updateSourceError) {
    console.error("Error updating source inventory:", updateSourceError);
    throw updateSourceError;
  }

  // Sumar al inventario de destino
  const { data: destInventory, error: destQueryError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', request.productId)
    .eq('warehouse_id', request.destinationWarehouseId)
    .single();

  if (destQueryError) {
    console.error("Error checking destination inventory:", destQueryError);
    throw destQueryError;
  }

  const { error: updateDestError } = await supabase
    .from('inventory')
    .update({
      quantity: destInventory.quantity + request.quantity,
      updated_at: new Date().toISOString()
    })
    .eq('product_id', request.productId)
    .eq('warehouse_id', request.destinationWarehouseId);

  if (updateDestError) {
    console.error("Error updating destination inventory:", updateDestError);
    throw updateDestError;
  }

  // Registrar el movimiento
  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert([{
      product_id: request.productId,
      warehouse_id: request.sourceWarehouseId,
      quantity: request.quantity,
      type: 'transferencia',
      responsible_id: request.responsibleId,
      source_warehouse_id: request.sourceWarehouseId,
      destination_warehouse_id: request.destinationWarehouseId,
      notes: request.notes || 'Transferencia entre bodegas'
    }]);

  if (movementError) {
    console.error("Error recording movement:", movementError);
    throw movementError;
  }

  return true;
};

// Función para obtener los movimientos de inventario
export const getInventoryMovements = async (): Promise<InventoryMovement[]> => {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      id,
      product_id,
      products(name),
      warehouse_id,
      warehouses!inventory_movements_warehouse_id_fkey(name),
      quantity,
      type,
      responsible_id,
      users(name),
      notes,
      created_at,
      source_warehouse_id,
      warehouses!inventory_movements_source_warehouse_id_fkey(name),
      destination_warehouse_id,
      warehouses!inventory_movements_destination_warehouse_id_fkey(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching inventory movements:", error);
    throw error;
  }

  return data.map(movement => ({
    id: movement.id,
    productId: movement.product_id,
    productName: movement.products?.name,
    warehouseId: movement.warehouse_id,
    warehouseName: movement.warehouses?.name,
    quantity: movement.quantity,
    type: movement.type as 'entrada' | 'salida' | 'transferencia',
    responsibleId: movement.responsible_id,
    responsibleName: movement.users?.name,
    notes: movement.notes,
    createdAt: movement.created_at,
    sourceWarehouseId: movement.source_warehouse_id,
    sourceWarehouseName: movement.warehouses?.name,
    destinationWarehouseId: movement.destination_warehouse_id,
    destinationWarehouseName: movement.warehouses?.name
  }));
};

// Función para agregar un movimiento de inventario
export const addInventoryMovement = async (
  productId: string,
  type: 'entrada' | 'salida',
  quantity: number,
  responsibleId: string,
  warehouseId: string,
  notes?: string
): Promise<InventoryMovement> => {
  // Verificar y actualizar el inventario
  const { data: inventoryData, error: inventoryError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single();

  if (inventoryError) {
    console.error("Error checking inventory:", inventoryError);
    throw inventoryError;
  }

  let newQuantity: number;
  
  if (type === 'entrada') {
    newQuantity = inventoryData.quantity + quantity;
  } else { // salida
    if (inventoryData.quantity < quantity) {
      throw new Error(`Stock insuficiente en la bodega. Disponible: ${inventoryData.quantity}`);
    }
    newQuantity = inventoryData.quantity - quantity;
  }

  // Actualizar el inventario
  const { error: updateError } = await supabase
    .from('inventory')
    .update({
      quantity: newQuantity,
      updated_at: new Date().toISOString()
    })
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId);

  if (updateError) {
    console.error("Error updating inventory:", updateError);
    throw updateError;
  }

  // Registrar el movimiento
  const { data: movementData, error: movementError } = await supabase
    .from('inventory_movements')
    .insert([{
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: quantity,
      type: type,
      responsible_id: responsibleId,
      notes: notes
    }])
    .select(`
      id,
      product_id,
      products(name),
      warehouse_id,
      warehouses(name),
      quantity,
      type,
      responsible_id,
      users(name),
      notes,
      created_at
    `)
    .single();

  if (movementError) {
    console.error("Error recording movement:", movementError);
    throw movementError;
  }

  return {
    id: movementData.id,
    productId: movementData.product_id,
    productName: movementData.products?.name,
    warehouseId: movementData.warehouse_id,
    warehouseName: movementData.warehouses?.name,
    quantity: movementData.quantity,
    type: movementData.type,
    responsibleId: movementData.responsible_id,
    responsibleName: movementData.users?.name,
    notes: movementData.notes,
    createdAt: movementData.created_at
  };
};

// Hook para usar el servicio de inventario con toast notifications
export const useInventoryService = () => {
  const { toast } = useToast();

  return {
    getWarehouses,
    getProducts,
    getInventory,
    getProductInventory,
    
    addProduct: async (product: Omit<Product, 'id'>) => {
      try {
        const newProduct = await addProduct(product);
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
    
    updateProduct: async (product: Product) => {
      try {
        const updatedProduct = await updateProduct(product);
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
    
    deleteProduct: async (productId: string) => {
      try {
        const result = await deleteProduct(productId);
        if (result) {
          toast({
            title: "Producto eliminado",
            description: "El producto ha sido eliminado del inventario."
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
    
    transferProduct: async (request: TransferRequest) => {
      try {
        const result = await transferProduct(request);
        toast({
          title: "Transferencia exitosa",
          description: `Se han transferido ${request.quantity} unidades correctamente.`
        });
        return result;
      } catch (error: any) {
        toast({
          title: "Error en la transferencia",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    addMovement: async (
      productId: string,
      type: 'entrada' | 'salida',
      quantity: number,
      responsibleId: string,
      warehouseId: string,
      notes?: string
    ) => {
      try {
        const result = await addInventoryMovement(productId, type, quantity, responsibleId, warehouseId, notes);
        toast({
          title: "Movimiento registrado",
          description: `Se ha registrado un ${type} de inventario en la bodega seleccionada.`
        });
        return result;
      } catch (error: any) {
        toast({
          title: "Error al registrar movimiento",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    },
    
    getMovements: getInventoryMovements
  };
};
