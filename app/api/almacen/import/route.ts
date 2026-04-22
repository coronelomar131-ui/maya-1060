import { NextRequest, NextResponse } from 'next/server';
import { getProductos, getProductoBySku, createProducto } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { Producto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admin can import
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload || payload.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden importar productos' },
        { status: 403 }
      );
    }

    // Parse request body - expecting array of products
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array of products' },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as { row: number; error: string }[],
    };

    // Get existing productos to check for duplicates
    const existingProductos = await getProductos();
    const existingSkus = new Set(existingProductos.map((p) => p.sku));

    // Process each product
    for (let i = 0; i < body.length; i++) {
      try {
        const product = body[i];

        // Validate required fields
        if (!product.nombre || !product.sku || product.precio === undefined || product.stock === undefined || !product.costo || !product.categoria) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields: nombre, sku, precio, stock, costo, categoria',
          });
          continue;
        }

        // Check if SKU already exists
        if (existingSkus.has(product.sku)) {
          results.skipped++;
          continue;
        }

        // Create new product
        await createProducto({
          id: 0,
          nombre: product.nombre,
          sku: product.sku,
          precio: Number(product.precio),
          stock: Number(product.stock),
          costo: Number(product.costo),
          categoria: product.categoria,
          min: product.min ? Number(product.min) : 0,
          max: product.max ? Number(product.max) : 999999,
          notas: product.notas || undefined,
        } as Producto);

        existingSkus.add(product.sku);
        results.created++;
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results,
    }, { status: 201 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
