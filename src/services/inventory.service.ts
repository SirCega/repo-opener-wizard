import { supabase } from '@/integrations/supabase/client';
import { 
  Product, 
  Warehouse, 
  Movement, 
  InventoryItem, 
  TransferRequest 
} from '@/types/inventory-types';

// Get all products with their stock information
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;

    // Get inventory for each product
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*');
    
    if (inventoryError) throw inventoryError;

    // Transform the products to include warehouse quantities
    const productsWithQuantities = products.map(product => {
      const productInventory = inventory.filter(item => item.product_id === product.id);
      
      // Create warehouse_quantities object
      const warehouse_quantities: {[warehouseId: string]: number} = {};
      productInventory.forEach(item => {
        warehouse_quantities[item.warehouse_id] = item.quantity;
      });

      return {
        ...product,
        warehouse_quantities,
        // Add these fields for UI compatibility
        mainWarehouse: warehouse_quantities["w1"] || 0,
        warehouse1: warehouse_quantities["w1"] || 0,
        warehouse2: warehouse_quantities["w2"] || 0,
        warehouse3: warehouse_quantities["w3"] || 0
      };
    });

    return productsWithQuantities;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Alias for getProducts to maintain compatibility
export const getAllProducts = getProducts;

// Get all warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

// Make sure we have a proper warehouse interface in the Movement type
export interface Warehouse {
  name: string;
  [key: string]: any; // Allow additional properties
}

export interface Movement {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  type: string;
  notes: string;
  responsible_id: string;
  created_at: string;
  product?: {
    name: string;
    sku: string;
  };
  warehouse: Warehouse; // Use the warehouse interface
  responsible?: {
    name: string;
  };
  source_warehouse_id?: string;
  destination_warehouse_id?: string;
  source_warehouse?: Warehouse;
  destination_warehouse?: Warehouse;
  [key: string]: any; // Allow additional properties for flexibility
}

// Get inventory movements history
export const getMovements = async (): Promise<Movement[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        product:product_id (name, sku),
        warehouse:warehouse_id (name, type),
        source_warehouse:source_warehouse_id (name),
        destination_warehouse:destination_warehouse_id (name),
        responsible:responsible_id (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ensure warehouse has a name property even if there's an error
    return data.map(movement => ({
      ...movement,
      warehouse: movement.warehouse || { name: 'Almacén desconocido' },
      source_warehouse: movement.source_warehouse || (movement.source_warehouse_id ? { name: 'Almacén desconocido' } : undefined),
      destination_warehouse: movement.destination_warehouse || (movement.destination_warehouse_id ? { name: 'Almacén desconocido' } : undefined)
    }));
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    return [];
  }
};

// Get inventory for a specific warehouse
export const getInventory = async (warehouseId?: string): Promise<InventoryItem[]> => {
  try {
    let query = supabase.from('inventory').select('*');
    
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

// Add a new product
export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    // First add the product to products table
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        price: product.price,
        category: product.category,
        threshold: product.threshold,
        box_qty: product.box_qty
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Initialize the inventory for this product in each warehouse
    const warehouses = ['w1', 'w2', 'w3']; // You might want to get this from getWarehouses()
    const inventoryItems = warehouses.map(warehouseId => ({
      product_id: data.id,
      warehouse_id: warehouseId,
      quantity: warehouseId === 'w1' ? product.mainWarehouse || 0 :
                warehouseId === 'w2' ? product.warehouse2 || 0 :
                warehouseId === 'w3' ? product.warehouse3 || 0 : 0
    }));
    
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert(inventoryItems);
      
    if (inventoryError) throw inventoryError;
    
    // Return the created product with warehouse quantities
    return {
      ...data,
      warehouse_quantities: {
        w1: product.mainWarehouse || 0,
        w2: product.warehouse2 || 0,
        w3: product.warehouse3 || 0
      },
      mainWarehouse: product.mainWarehouse || 0,
      warehouse1: product.mainWarehouse || 0,
      warehouse2: product.warehouse2 || 0,
      warehouse3: product.warehouse3 || 0
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    // Update the product in products table
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        category: product.category,
        threshold: product.threshold,
        box_qty: product.box_qty
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update inventory if warehouse quantities have changed
    if (product.mainWarehouse !== undefined || 
        product.warehouse2 !== undefined || 
        product.warehouse3 !== undefined) {
          
      // Get current inventory
      const { data: currentInventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', id);
        
      if (inventoryError) throw inventoryError;
      
      // Update each warehouse quantity
      const updates = [];
      
      if (product.mainWarehouse !== undefined) {
        const w1Item = currentInventory.find(item => item.warehouse_id === 'w1');
        if (w1Item) {
          updates.push(supabase
            .from('inventory')
            .update({ quantity: product.mainWarehouse })
            .eq('id', w1Item.id));
        } else {
          updates.push(supabase
            .from('inventory')
            .insert({ product_id: id, warehouse_id: 'w1', quantity: product.mainWarehouse }));
        }
      }
      
      if (product.warehouse2 !== undefined) {
        const w2Item = currentInventory.find(item => item.warehouse_id === 'w2');
        if (w2Item) {
          updates.push(supabase
            .from('inventory')
            .update({ quantity: product.warehouse2 })
            .eq('id', w2Item.id));
        } else {
          updates.push(supabase
            .from('inventory')
            .insert({ product_id: id, warehouse_id: 'w2', quantity: product.warehouse2 }));
        }
      }
      
      if (product.warehouse3 !== undefined) {
        const w3Item = currentInventory.find(item => item.warehouse_id === 'w3');
        if (w3Item) {
          updates.push(supabase
            .from('inventory')
            .update({ quantity: product.warehouse3 })
            .eq('id', w3Item.id));
        } else {
          updates.push(supabase
            .from('inventory')
            .insert({ product_id: id, warehouse_id: 'w3', quantity: product.warehouse3 }));
        }
      }
      
      await Promise.all(updates.map(update => update.then()));
    }
    
    // Get updated inventory to return complete product
    const { data: updatedInventory, error: updatedInventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', id);
      
    if (updatedInventoryError) throw updatedInventoryError;
    
    // Create warehouse_quantities object
    const warehouse_quantities: {[warehouseId: string]: number} = {};
    updatedInventory.forEach(item => {
      warehouse_quantities[item.warehouse_id] = item.quantity;
    });
    
    return {
      ...data,
      warehouse_quantities,
      mainWarehouse: warehouse_quantities["w1"] || 0,
      warehouse1: warehouse_quantities["w1"] || 0,
      warehouse2: warehouse_quantities["w2"] || 0,
      warehouse3: warehouse_quantities["w3"] || 0
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // First delete related inventory entries
    const { error: inventoryError } = await supabase
      .from('inventory')
      .delete()
      .eq('product_id', id);
    
    if (inventoryError) throw inventoryError;
    
    // Then delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Add inventory movement
export const addMovement = async (movement: Omit<Movement, "id" | "created_at">): Promise<Movement> => {
  try {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        type: movement.type,
        product_id: movement.product_id,
        warehouse_id: movement.warehouse_id,
        quantity: movement.quantity,
        source_warehouse_id: movement.source_warehouse_id,
        destination_warehouse_id: movement.destination_warehouse_id,
        responsible_id: movement.responsible_id,
        notes: movement.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update inventory based on movement type
    if (movement.type === 'entrada') {
      await updateInventoryQuantity(movement.product_id, movement.warehouse_id, movement.quantity);
    } else if (movement.type === 'salida') {
      await updateInventoryQuantity(movement.product_id, movement.warehouse_id, -movement.quantity);
    } else if (movement.type === 'transferencia' && movement.source_warehouse_id && movement.destination_warehouse_id) {
      await updateInventoryQuantity(movement.product_id, movement.source_warehouse_id, -movement.quantity);
      await updateInventoryQuantity(movement.product_id, movement.destination_warehouse_id, movement.quantity);
    }
    
    return data;
  } catch (error) {
    console.error('Error adding movement:', error);
    throw error;
  }
};

// Helper function to update inventory quantity
const updateInventoryQuantity = async (productId: string, warehouseId: string, quantity: number) => {
  try {
    // Check if inventory entry exists
    const { data: existing, error: checkError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError; // PGRST116 is a "not found" error
    
    if (existing) {
      // Update existing entry
      const newQuantity = existing.quantity + quantity;
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', existing.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new entry
      const { error: insertError } = await supabase
        .from('inventory')
        .insert({
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: quantity
        });
      
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
};

// Add inventory
export const addInventory = async (inventory: Omit<InventoryItem, "id">): Promise<InventoryItem> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        product_id: inventory.product_id,
        warehouse_id: inventory.warehouse_id,
        quantity: inventory.quantity
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding inventory:', error);
    throw error;
  }
};

// Update inventory
export const updateInventory = async (id: string, inventory: Partial<InventoryItem>): Promise<InventoryItem> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        product_id: inventory.product_id,
        warehouse_id: inventory.warehouse_id,
        quantity: inventory.quantity
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Transfer products between warehouses
export const transferProducts = async (transfer: TransferRequest): Promise<Movement> => {
  try {
    // Create a movement for this transfer
    const movement = await addMovement({
      type: 'transferencia',
      product_id: transfer.product_id,
      warehouse_id: transfer.sourceWarehouseId, // Source warehouse as primary warehouse
      source_warehouse_id: transfer.sourceWarehouseId,
      destination_warehouse_id: transfer.destinationWarehouseId,
      quantity: transfer.quantity,
      responsible_id: transfer.responsible_id || '',
      notes: transfer.notes
    });
    
    return movement;
  } catch (error) {
    console.error('Error transferring products:', error);
    throw error;
  }
};

// Update product stock
export const updateStock = async (productId: string, warehouseId: string, quantity: number): Promise<void> => {
  try {
    await updateInventoryQuantity(productId, warehouseId, quantity);
  } catch (error) {
    console.error(`Error updating stock for product ${productId} in warehouse ${warehouseId}:`, error);
    throw error;
  }
};
