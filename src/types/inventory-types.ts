

// Define and export Product interface with warehouse_quantities
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  category: string;
  threshold: number;
  box_qty: number;
  warehouse_quantities?: {
    [warehouseId: string]: number;
  };
  // These fields are used for UI compatibility
  mainWarehouse?: number;
  warehouse1?: number;
  warehouse2?: number;
  warehouse3?: number;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  updated_at?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  address: string;
}

export interface Movement {
  id: string;
  type: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  source_warehouse_id?: string;
  destination_warehouse_id?: string;
  responsible_id?: string;
  created_at: string;
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
  notes?: string;
}

export interface TransferRequest {
  product_id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  responsible_id?: string;
  notes?: string;
}

