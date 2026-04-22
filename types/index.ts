export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  pin: string;
  rol: 'admin' | 'user';
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  costo: number;
  categoria: string;
  min: number;
  max: number;
  notas?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}

export interface Venta {
  id: number;
  fecha: string;
  cliente: string;
  productos: Array<{ id: number; cantidad: number; precio: number }>;
  total: number;
  cobro: 'cobrado' | 'pendiente';
  responsable: string;
  notas?: string;
  reporte?: string;
  guia?: string;
}

export interface Config {
  nombre: string;
  descripcion?: string;
  logo?: string;
  rfc?: string;
  tel?: string;
  email?: string;
  dir?: string;
}
