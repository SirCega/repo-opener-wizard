
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  box_qty: number;
  threshold: number;
  image_url?: string;
  // No incluimos campos que no sean parte del modelo
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  updated_at?: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  address?: string;
}

export interface TransferRequest {
  product_id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  type: string;
  source_warehouse_id?: string;
  destination_warehouse_id?: string;
  responsible_id: string;
  notes?: string;
  created_at?: string;
  source?: Warehouse;
  destination?: Warehouse;
  warehouse?: Warehouse;
  product?: Product;
  responsible?: { name: string };
}
