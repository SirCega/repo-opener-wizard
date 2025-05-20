
import { useState, useEffect } from 'react';
import { 
  getAllInventory, 
  getAllProducts, 
  getAllWarehouses,
  getInventoryMovements,
  updateInventoryQuantity,
  transferInventory
} from '@/services/inventory.service';
import { 
  Product, 
  InventoryItem, 
  Warehouse, 
  InventoryMovement, 
  TransferRequest 
} from '@/types/inventory-types';

export function useInventoryService() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadInventory();
    loadWarehouses();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
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
      const data = await getAllInventory();
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
      const data = await getAllWarehouses();
      setWarehouses(data);
      setError(null);
    } catch (err) {
      setError('Error loading warehouses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (productId?: string) => {
    try {
      setLoading(true);
      const data = await getInventoryMovements(productId);
      setMovements(data);
      setError(null);
    } catch (err) {
      setError('Error loading movements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (inventoryId: string, newQuantity: number) => {
    try {
      setLoading(true);
      const success = await updateInventoryQuantity(inventoryId, newQuantity);
      if (success) {
        await loadInventory();
      } else {
        setError('Failed to update quantity');
      }
      return success;
    } catch (err) {
      setError('Error updating quantity');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const transferStock = async (transfer: TransferRequest, userId: string, notes?: string) => {
    try {
      setLoading(true);
      const success = await transferInventory(transfer, userId, notes);
      if (success) {
        await loadInventory();
        await loadMovements();
      } else {
        setError('Failed to transfer inventory');
      }
      return success;
    } catch (err) {
      setError('Error transferring inventory');
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
    updateQuantity,
    transferStock
  };
}
