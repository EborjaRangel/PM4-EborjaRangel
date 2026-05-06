export interface PurchaseShippingDto {
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface CreatePurchaseRecordDto {
  clientUserId: string;
  userEmail: string;
  items: unknown[];
  totals: {
    subtotal: number;
    shipping: number;
    taxes: number;
    total: number;
  };
  shipping?: PurchaseShippingDto | null;
}
