export interface SalesData {
  Cliente: string;
  País: string;
  Canal: string;
  "Forma de pago": string;
  Producto: string;
  Vendedor: string;
  Fecha: Date;
  Ventas: number;
  Cantidad: number;
}

export interface DashboardStats {
  totalSales: number;
  totalQuantity: number;
  avgOrderValue: number;
  totalCustomers: number;
  salesByCountry: { name: string; value: number }[];
  salesByChannel: { name: string; value: number }[];
  salesBySeller: { name: string; value: number }[];
  salesOverTime: { date: string; value: number }[];
}
