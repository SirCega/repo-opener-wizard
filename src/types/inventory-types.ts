
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  category: string;
  threshold: number;
  box_qty: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  
  // Stock quantities in different warehouses
  stock?: {
    [warehouseId: string]: number;
  };
  
  // UI specific fields for warehouse quantities
  warehouse_quantities?: {
    [key: string]: number;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  address?: string;
}

export interface Movement {
  id: string;
  type: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
  product_id: string;
  warehouse_id: string;
  quantity: number;
  source_warehouse_id?: string;
  destination_warehouse_id?: string;
  responsible_id: string;
  notes?: string;
  created_at?: string;
  
  // Extended information
  product?: {
    name: string;
    sku: string;
  };
  warehouse?: {
    name: string;
  };
  source_warehouse?: {
    name: string;
  };
  destination_warehouse?: {
    name: string;
  };
  responsible?: {
    name: string;
  };
}

export interface TransferRequest {
  product_id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  responsible_id: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  updated_at?: string;
  
  // Extended information
  product?: Product;
  warehouse?: Warehouse;
}

// Alias Movement as InventoryMovement for compatibility
export type InventoryMovement = Movement;

export interface ProductWithStock extends Omit<Product, 'stock'> {
  stock: number;
}
