
import { useState, useEffect } from 'react';
import * as inventoryService from '@/services/inventory.service';

// Export the types from the inventory service
export type { Product, InventoryItem, Warehouse, Movement, TransferRequest } from '@/services/inventory.service';

export function useInventoryService() {
  const [products, setProducts] = useState<inventoryService.Product[]>([]);
  const [inventory, setInventory] = useState<inventoryService.InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<inventoryService.Warehouse[]>([]);
  const [movements, setMovements] = useState<inventoryService.Movement[]>([]);
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
      const data = await getProducts();
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
      const data = await getInventory(undefined);
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
      const data = await getWarehouses();
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
      const data = await getMovements();
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
  const handleAddProduct = async (productData: Omit<inventoryService.Product, "id">) => {
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

  const handleUpdateProduct = async (id: string, productData: Partial<inventoryService.Product>) => {
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
  const handleAddMovement = async (movementData: Omit<Movement, 'id'>) => {
    try {
      setLoading(true);
      await addMovement(movementData);
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
      await updateInventory(id, inventoryData);
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
      await addInventory(inventoryData);
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
    transferProduct: (transfer: {
      product_id: string;
      sourceWarehouseId: string;
      destinationWarehouseId: string;
      quantity: number;
    }) => {
      console.log("Transferring products:", transfer);
      // Mock implementation
      return products.find(p => p.id === transfer.product_id) || products[0];
    }
  };
}
