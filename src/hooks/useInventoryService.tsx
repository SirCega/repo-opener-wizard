
import { useState, useEffect } from 'react';
import * as inventoryService from '@/services/inventory.service';
import { Product, Warehouse, Movement, TransferRequest } from '@/types/inventory-types';

export function useInventoryService() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
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

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      setLoading(true);
      await inventoryService.addProduct(product);
      await loadProducts();
      setError(null);
      return true;
    } catch (err) {
      setError('Error adding product');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addMovement = async (movement: Omit<Movement, "id" | "created_at">) => {
    try {
      setLoading(true);
      await inventoryService.addMovement(movement);
      await loadMovements();
      await loadProducts(); // Reload products as quantities may have changed
      setError(null);
      return true;
    } catch (err) {
      setError('Error adding movement');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const transferProducts = async (transfer: TransferRequest) => {
    try {
      setLoading(true);
      await inventoryService.transferProducts(transfer);
      await loadProducts(); // Reload products after transfer
      await loadMovements(); // Reload movements to show the transfer
      setError(null);
      return true;
    } catch (err) {
      setError('Error transferring products');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    warehouses,
    movements,
    loading,
    error,
    loadProducts,
    loadWarehouses,
    loadMovements,
    addProduct,
    addMovement,
    transferProducts
  };
}
