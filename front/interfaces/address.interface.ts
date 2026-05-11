export interface IAddress {
  id: number;
  userId: number;
  label: string;
  address: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface IAddressInput {
  label?: string;
  address: string;
  phone: string;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}
