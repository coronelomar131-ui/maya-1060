import { NextRequest, NextResponse } from 'next/server';
import { getClienteById, updateCliente, deleteCliente } from '@/lib/supabase-server';
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
    const clienteId = parseInt(id, 10);

    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'Invalid cliente ID' },
        { status: 400 }
      );
    }

    // Check if cliente exists
    const existingCliente = await getClienteById(clienteId);

    if (!existingCliente) {
      return NextResponse.json(
        { error: 'Cliente not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update cliente
    const updatedCliente = await updateCliente(clienteId, body);

    return NextResponse.json({
      data: updatedCliente,
    });
  } catch (error) {
    console.error('Update cliente error:', error);
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
    const clienteId = parseInt(id, 10);

    if (isNaN(clienteId)) {
      return NextResponse.json(
        { error: 'Invalid cliente ID' },
        { status: 400 }
      );
    }

    // Check if cliente exists
    const existingCliente = await getClienteById(clienteId);

    if (!existingCliente) {
      return NextResponse.json(
        { error: 'Cliente not found' },
        { status: 404 }
      );
    }

    // Delete cliente
    await deleteCliente(clienteId);

    return NextResponse.json({
      message: 'Cliente deleted successfully',
    });
  } catch (error) {
    console.error('Delete cliente error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
