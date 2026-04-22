import { createClient } from '@supabase/supabase-js';
import { Usuario, Producto, Cliente, Venta } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role for admin operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Query usuarios table and return data array
 */
export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabaseServer
      .from('usuarios')
      .select('*')
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data[0]?.data || [];
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    throw error;
  }
}

/**
 * Find a single usuario by username
 */
export async function getUsuarioByUsername(usuario: string): Promise<Usuario | null> {
  try {
    const usuarios = await getUsuarios();
    return usuarios.find((u) => u.usuario === usuario) || null;
  } catch (error) {
    console.error('Error fetching usuario by username:', error);
    throw error;
  }
}

/**
 * Create a new usuario
 */
export async function createUsuario(newUsuario: Usuario): Promise<Usuario> {
  try {
    const usuarios = await getUsuarios();
    const maxId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) : 0;
    const usuarioWithId = { ...newUsuario, id: maxId + 1 };

    const { error } = await supabaseServer
      .from('usuarios')
      .update({ data: [...usuarios, usuarioWithId] })
      .eq('id', 1);

    if (error) throw error;
    return usuarioWithId;
  } catch (error) {
    console.error('Error creating usuario:', error);
    throw error;
  }
}

/**
 * Query productos table and return data array
 */
export async function getProductos(): Promise<Producto[]> {
  try {
    const { data, error } = await supabaseServer
      .from('almacen')
      .select('*')
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data[0]?.data || [];
  } catch (error) {
    console.error('Error fetching productos:', error);
    throw error;
  }
}

/**
 * Get a single producto by ID
 */
export async function getProductoById(id: number): Promise<Producto | null> {
  try {
    const productos = await getProductos();
    return productos.find((p) => p.id === id) || null;
  } catch (error) {
    console.error('Error fetching producto by id:', error);
    throw error;
  }
}

/**
 * Check if product SKU already exists
 */
export async function getProductoBySku(sku: string): Promise<Producto | null> {
  try {
    const productos = await getProductos();
    return productos.find((p) => p.sku === sku) || null;
  } catch (error) {
    console.error('Error fetching producto by sku:', error);
    throw error;
  }
}

/**
 * Create a new producto
 */
export async function createProducto(newProducto: Producto): Promise<Producto> {
  try {
    const productos = await getProductos();
    const maxId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) : 0;
    const productoWithId = { ...newProducto, id: maxId + 1 };

    const { error } = await supabaseServer
      .from('almacen')
      .update({ data: [...productos, productoWithId] })
      .eq('id', 1);

    if (error) throw error;
    return productoWithId;
  } catch (error) {
    console.error('Error creating producto:', error);
    throw error;
  }
}

/**
 * Update an existing producto
 */
export async function updateProducto(id: number, updates: Partial<Producto>): Promise<Producto> {
  try {
    const productos = await getProductos();
    const index = productos.findIndex((p) => p.id === id);

    if (index === -1) throw new Error('Producto not found');

    const updatedProducto = { ...productos[index], ...updates };
    productos[index] = updatedProducto;

    const { error } = await supabaseServer
      .from('almacen')
      .update({ data: productos })
      .eq('id', 1);

    if (error) throw error;
    return updatedProducto;
  } catch (error) {
    console.error('Error updating producto:', error);
    throw error;
  }
}

/**
 * Delete a producto by ID
 */
export async function deleteProducto(id: number): Promise<void> {
  try {
    const productos = await getProductos();
    const filtered = productos.filter((p) => p.id !== id);

    const { error } = await supabaseServer
      .from('almacen')
      .update({ data: filtered })
      .eq('id', 1);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting producto:', error);
    throw error;
  }
}

/**
 * Query clientes table and return data array
 */
export async function getClientes(): Promise<Cliente[]> {
  try {
    const { data, error } = await supabaseServer
      .from('clientes')
      .select('*')
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data[0]?.data || [];
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
}

/**
 * Get a single cliente by ID
 */
export async function getClienteById(id: number): Promise<Cliente | null> {
  try {
    const clientes = await getClientes();
    return clientes.find((c) => c.id === id) || null;
  } catch (error) {
    console.error('Error fetching cliente by id:', error);
    throw error;
  }
}

/**
 * Create a new cliente
 */
export async function createCliente(newCliente: Cliente): Promise<Cliente> {
  try {
    const clientes = await getClientes();
    const maxId = clientes.length > 0 ? Math.max(...clientes.map((c) => c.id)) : 0;
    const clienteWithId = { ...newCliente, id: maxId + 1 };

    const { error } = await supabaseServer
      .from('clientes')
      .update({ data: [...clientes, clienteWithId] })
      .eq('id', 1);

    if (error) throw error;
    return clienteWithId;
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
}

/**
 * Update an existing cliente
 */
export async function updateCliente(id: number, updates: Partial<Cliente>): Promise<Cliente> {
  try {
    const clientes = await getClientes();
    const index = clientes.findIndex((c) => c.id === id);

    if (index === -1) throw new Error('Cliente not found');

    const updatedCliente = { ...clientes[index], ...updates };
    clientes[index] = updatedCliente;

    const { error } = await supabaseServer
      .from('clientes')
      .update({ data: clientes })
      .eq('id', 1);

    if (error) throw error;
    return updatedCliente;
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
}

/**
 * Delete a cliente by ID
 */
export async function deleteCliente(id: number): Promise<void> {
  try {
    const clientes = await getClientes();
    const filtered = clientes.filter((c) => c.id !== id);

    const { error } = await supabaseServer
      .from('clientes')
      .update({ data: filtered })
      .eq('id', 1);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
}

/**
 * Query ventas table and return data array
 */
export async function getVentas(): Promise<Venta[]> {
  try {
    const { data, error } = await supabaseServer
      .from('ventas')
      .select('*')
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data[0]?.data || [];
  } catch (error) {
    console.error('Error fetching ventas:', error);
    throw error;
  }
}

/**
 * Get a single venta by ID
 */
export async function getVentaById(id: number): Promise<Venta | null> {
  try {
    const ventas = await getVentas();
    return ventas.find((v) => v.id === id) || null;
  } catch (error) {
    console.error('Error fetching venta by id:', error);
    throw error;
  }
}

/**
 * Create a new venta
 */
export async function createVenta(newVenta: Venta): Promise<Venta> {
  try {
    const ventas = await getVentas();
    const maxId = ventas.length > 0 ? Math.max(...ventas.map((v) => v.id)) : 0;
    const ventaWithId = { ...newVenta, id: maxId + 1 };

    const { error } = await supabaseServer
      .from('ventas')
      .update({ data: [...ventas, ventaWithId] })
      .eq('id', 1);

    if (error) throw error;
    return ventaWithId;
  } catch (error) {
    console.error('Error creating venta:', error);
    throw error;
  }
}

/**
 * Update an existing venta
 */
export async function updateVenta(id: number, updates: Partial<Venta>): Promise<Venta> {
  try {
    const ventas = await getVentas();
    const index = ventas.findIndex((v) => v.id === id);

    if (index === -1) throw new Error('Venta not found');

    const updatedVenta = { ...ventas[index], ...updates };
    ventas[index] = updatedVenta;

    const { error } = await supabaseServer
      .from('ventas')
      .update({ data: ventas })
      .eq('id', 1);

    if (error) throw error;
    return updatedVenta;
  } catch (error) {
    console.error('Error updating venta:', error);
    throw error;
  }
}

/**
 * Delete a venta by ID
 */
export async function deleteVenta(id: number): Promise<void> {
  try {
    const ventas = await getVentas();
    const filtered = ventas.filter((v) => v.id !== id);

    const { error } = await supabaseServer
      .from('ventas')
      .update({ data: filtered })
      .eq('id', 1);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting venta:', error);
    throw error;
  }
}
