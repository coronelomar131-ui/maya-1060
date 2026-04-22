import { NextRequest, NextResponse } from 'next/server';
import { getVentaById, updateVenta, deleteVenta } from '@/lib/supabase-server';
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
    const ventaId = parseInt(id, 10);

    if (isNaN(ventaId)) {
      return NextResponse.json(
        { error: 'Invalid venta ID' },
        { status: 400 }
      );
    }

    // Check if venta exists
    const existingVenta = await getVentaById(ventaId);

    if (!existingVenta) {
      return NextResponse.json(
        { error: 'Venta not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update venta
    const updatedVenta = await updateVenta(ventaId, body);

    return NextResponse.json({
      data: updatedVenta,
    });
  } catch (error) {
    console.error('Update venta error:', error);
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
    const ventaId = parseInt(id, 10);

    if (isNaN(ventaId)) {
      return NextResponse.json(
        { error: 'Invalid venta ID' },
        { status: 400 }
      );
    }

    // Check if venta exists
    const existingVenta = await getVentaById(ventaId);

    if (!existingVenta) {
      return NextResponse.json(
        { error: 'Venta not found' },
        { status: 404 }
      );
    }

    // Delete venta
    await deleteVenta(ventaId);

    return NextResponse.json({
      message: 'Venta deleted successfully',
    });
  } catch (error) {
    console.error('Delete venta error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
