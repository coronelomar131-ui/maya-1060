import { NextRequest, NextResponse } from 'next/server';
import { getClientes, createCliente } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { Cliente } from '@/types';

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

    // Get all clientes
    let clientes = await getClientes();

    // Apply filters
    if (search) {
      clientes = clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(search.toLowerCase()) ||
          (c.empresa && c.empresa.toLowerCase().includes(search.toLowerCase())) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply pagination
    const total = clientes.length;
    const startIndex = (page - 1) * limit;
    const paginatedClientes = clientes.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedClientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get clientes error:', error);
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
    const { nombre, empresa, email, telefono, direccion, notas } = body;

    // Validate required fields
    if (!nombre) {
      return NextResponse.json(
        { error: 'nombre is required' },
        { status: 400 }
      );
    }

    // Create new cliente
    const newCliente = await createCliente({
      id: 0, // Will be set by createCliente
      nombre,
      empresa,
      email,
      telefono,
      direccion,
      notas,
    } as Cliente);

    return NextResponse.json({
      data: newCliente,
    }, { status: 201 });
  } catch (error) {
    console.error('Create cliente error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
