export type Product = {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  basePrice: number;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
};
