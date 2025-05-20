
import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryItem, Warehouse, InventoryMovement, TransferRequest } from '@/types/inventory-types';

/**
 * Obtener todos los productos con su inventario
 */
export const getAllInventory = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, product:product_id(*), warehouse:warehouse_id(*)');
      
    if (error) {
      console.error("Error fetching inventory:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllInventory:", error);
    return [];
  }
};

/**
 * Alias of getAllInventory for backward compatibility
 */
export const getInventory = getAllInventory;

/**
 * Obtener todos los almacenes
 */
export const getAllWarehouses = async (): Promise<Warehouse[]> => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*');
      
    if (error) {
      console.error("Error fetching warehouses:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllWarehouses:", error);
    return [];
  }
};

/**
 * Obtener todos los productos
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return [];
  }
};

/**
 * Actualizar la cantidad de inventario
 */
export const updateInventoryQuantity = async (
  inventoryId: string, 
  newQuantity: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId);
      
    if (error) {
      console.error("Error updating inventory:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateInventoryQuantity:", error);
    return false;
  }
};

/**
 * Realizar transferencia entre almacenes
 */
export const transferInventory = async (
  transfer: TransferRequest,
  userId: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Registrar movimiento de salida
    const { error: outError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: transfer.product_id,
        warehouse_id: transfer.sourceWarehouseId,
        quantity: -transfer.quantity, // Cantidad negativa para salida
        responsible_id: userId,
        type: 'transferencia_salida',
        destination_warehouse_id: transfer.destinationWarehouseId,
        notes
      });
      
    if (outError) {
      console.error("Error recording outbound movement:", outError);
      return false;
    }
    
    // Registrar movimiento de entrada
    const { error: inError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: transfer.product_id,
        warehouse_id: transfer.destinationWarehouseId,
        quantity: transfer.quantity, // Cantidad positiva para entrada
        responsible_id: userId,
        type: 'transferencia_entrada',
        source_warehouse_id: transfer.sourceWarehouseId,
        notes
      });
      
    if (inError) {
      console.error("Error recording inbound movement:", inError);
      return false;
    }
    
    // Actualizar inventario de origen
    const { data: sourceInventory, error: sourceQueryError } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', transfer.product_id)
      .eq('warehouse_id', transfer.sourceWarehouseId)
      .single();
      
    if (sourceQueryError) {
      console.error("Error querying source inventory:", sourceQueryError);
      return false;
    }
    
    if (sourceInventory) {
      const { error: sourceUpdateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: sourceInventory.quantity - transfer.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceInventory.id);
        
      if (sourceUpdateError) {
        console.error("Error updating source inventory:", sourceUpdateError);
        return false;
      }
    }
    
    // Actualizar o crear inventario de destino
    const { data: destInventory, error: destQueryError } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', transfer.product_id)
      .eq('warehouse_id', transfer.destinationWarehouseId)
      .single();
      
    if (destQueryError && destQueryError.code !== 'PGRST116') { // PGRST116 = No rows returned
      console.error("Error querying destination inventory:", destQueryError);
      return false;
    }
    
    if (destInventory) {
      // Actualizar inventario existente
      const { error: destUpdateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: destInventory.quantity + transfer.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', destInventory.id);
        
      if (destUpdateError) {
        console.error("Error updating destination inventory:", destUpdateError);
        return false;
      }
    } else {
      // Crear nuevo registro de inventario
      const { error: destInsertError } = await supabase
        .from('inventory')
        .insert({
          product_id: transfer.product_id,
          warehouse_id: transfer.destinationWarehouseId,
          quantity: transfer.quantity
        });
        
      if (destInsertError) {
        console.error("Error creating destination inventory:", destInsertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in transferInventory:", error);
    return false;
  }
};

/**
 * Obtener historial de movimientos
 */
export const getInventoryMovements = async (productId?: string): Promise<InventoryMovement[]> => {
  try {
    let query = supabase
      .from('inventory_movements')
      .select('*, source:source_warehouse_id(name), destination:destination_warehouse_id(name), warehouse:warehouse_id(name), product:product_id(name), responsible:responsible_id(name)');
      
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching inventory movements:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getInventoryMovements:", error);
    return [];
  }
};

// Export all types from the types file for backward compatibility
export type { Product, InventoryItem, Warehouse, InventoryMovement, TransferRequest };
