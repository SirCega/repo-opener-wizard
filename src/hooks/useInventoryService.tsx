
import { useState, useEffect } from 'react';
import * as inventoryService from '@/services/inventory.service';
import { 
  Product, 
  Warehouse, 
  Movement, 
  InventoryItem, 
  TransferRequest 
} from '@/types/inventory-types';

export function useInventoryService() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadInventory();
    loadWarehouses();
    loadMovements();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error loading products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      // Pass undefined to get all inventory
      const data = await inventoryService.getInventory(undefined);
      setInventory(data);
      setError(null);
    } catch (err) {
      setError('Error loading inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getWarehouses();
      setWarehouses(data);
      setError(null);
    } catch (err) {
      setError('Error loading warehouses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getMovements();
      setMovements(data);
      setError(null);
    } catch (err) {
      setError('Error loading movements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Product Operations
  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    try {
      setLoading(true);
      await inventoryService.addProduct(productData);
      await loadProducts();
      return true;
    } catch (err) {
      setError('Error adding product');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setLoading(true);
      await inventoryService.updateProduct(id, productData);
      await loadProducts();
      return true;
    } catch (err) {
      setError('Error updating product');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await inventoryService.deleteProduct(id);
      await loadProducts();
      return true;
    } catch (err) {
      setError('Error deleting product');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Movement Operations
  const handleAddMovement = async (movementData: Omit<Movement, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      await inventoryService.addMovement(movementData);
      await Promise.all([loadMovements(), loadInventory()]);
      return true;
    } catch (err) {
      setError('Error adding movement');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Inventory Operations
  const handleUpdateInventory = async (id: string, inventoryData: Partial<InventoryItem>) => {
    try {
      setLoading(true);
      await inventoryService.updateInventory(id, inventoryData);
      await loadInventory();
      return true;
    } catch (err) {
      setError('Error updating inventory');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async (inventoryData: Omit<InventoryItem, 'id'>) => {
    try {
      setLoading(true);
      await inventoryService.addInventory(inventoryData);
      await loadInventory();
      return true;
    } catch (err) {
      setError('Error adding inventory');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    inventory,
    warehouses,
    movements,
    loading,
    error,
    loadProducts,
    loadInventory,
    loadWarehouses,
    loadMovements,
    addProduct: handleAddProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    addMovement: handleAddMovement,
    updateInventory: handleUpdateInventory,
    addInventory: handleAddInventory,
    getInventory: () => {
      return products.map(p => ({
        ...p,
        mainWarehouse: p.warehouse_quantities?.["w1"] || 0,
        warehouse1: p.warehouse_quantities?.["w1"] || 0,
        warehouse2: p.warehouse_quantities?.["w2"] || 0,
        warehouse3: p.warehouse_quantities?.["w3"] || 0
      }));
    },
    transferProduct: async (transfer: TransferRequest) => {
      try {
        setLoading(true);
        const result = await inventoryService.transferProducts(transfer);
        await Promise.all([loadInventory(), loadMovements()]);
        return result;
      } catch (err) {
        setError('Error transferring products');
        console.error(err);
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
}

// Re-export the types for convenient imports
export type { Product, Warehouse, Movement, InventoryItem, TransferRequest } from '@/types/inventory-types';
