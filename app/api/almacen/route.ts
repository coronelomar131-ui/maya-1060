import { NextRequest, NextResponse } from 'next/server';
import { getProductos, createProducto, getProductoBySku } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { Producto } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const categoria = searchParams.get('categoria') || '';

    // Get all productos
    let productos = await getProductos();

    // Apply filters
    if (search) {
      productos = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoria) {
      productos = productos.filter((p) => p.categoria === categoria);
    }

    // Apply pagination
    const total = productos.length;
    const startIndex = (page - 1) * limit;
    const paginatedProductos = productos.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedProductos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get productos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nombre, sku, precio, stock, costo, categoria, min, max, notas } = body;

    // Validate required fields
    if (!nombre || !sku || precio === undefined || stock === undefined || !costo || !categoria) {
      return NextResponse.json(
        { error: 'nombre, sku, precio, stock, costo, and categoria are required' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingSku = await getProductoBySku(sku);

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }

    // Create new producto
    const newProducto = await createProducto({
      id: 0, // Will be set by createProducto
      nombre,
      sku,
      precio,
      stock,
      costo,
      categoria,
      min: min || 0,
      max: max || 999999,
      notas,
    } as Producto);

    return NextResponse.json({
      data: newProducto,
    }, { status: 201 });
  } catch (error) {
    console.error('Create producto error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
