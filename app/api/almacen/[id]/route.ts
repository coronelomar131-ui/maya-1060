import { NextRequest, NextResponse } from 'next/server';
import { getProductoById, updateProducto, deleteProducto } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const productoId = parseInt(id, 10);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: 'Invalid producto ID' },
        { status: 400 }
      );
    }

    // Check if producto exists
    const existingProducto = await getProductoById(productoId);

    if (!existingProducto) {
      return NextResponse.json(
        { error: 'Producto not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update producto
    const updatedProducto = await updateProducto(productoId, body);

    return NextResponse.json({
      data: updatedProducto,
    });
  } catch (error) {
    console.error('Update producto error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const productoId = parseInt(id, 10);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: 'Invalid producto ID' },
        { status: 400 }
      );
    }

    // Check if producto exists
    const existingProducto = await getProductoById(productoId);

    if (!existingProducto) {
      return NextResponse.json(
        { error: 'Producto not found' },
        { status: 404 }
      );
    }

    // Delete producto
    await deleteProducto(productoId);

    return NextResponse.json({
      message: 'Producto deleted successfully',
    });
  } catch (error) {
    console.error('Delete producto error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
