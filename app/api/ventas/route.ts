import { NextRequest, NextResponse } from 'next/server';
import { getVentas, createVenta } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { Venta } from '@/types';

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
    const cobro = searchParams.get('cobro') || '';

    // Get all ventas
    let ventas = await getVentas();

    // Apply filters
    if (search) {
      ventas = ventas.filter(
        (v) =>
          v.cliente.toLowerCase().includes(search.toLowerCase()) ||
          v.responsable.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (cobro && ['cobrado', 'pendiente'].includes(cobro)) {
      ventas = ventas.filter((v) => v.cobro === cobro);
    }

    // Apply pagination
    const total = ventas.length;
    const startIndex = (page - 1) * limit;
    const paginatedVentas = ventas.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedVentas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get ventas error:', error);
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
    const { fecha, cliente, productos, total, cobro, responsable, notas, reporte, guia } = body;

    // Validate required fields
    if (!fecha || !cliente || !productos || total === undefined || !cobro || !responsable) {
      return NextResponse.json(
        { error: 'fecha, cliente, productos, total, cobro, and responsable are required' },
        { status: 400 }
      );
    }

    // Validate cobro value
    if (!['cobrado', 'pendiente'].includes(cobro)) {
      return NextResponse.json(
        { error: 'cobro must be "cobrado" or "pendiente"' },
        { status: 400 }
      );
    }

    // Create new venta
    const newVenta = await createVenta({
      id: 0, // Will be set by createVenta
      fecha,
      cliente,
      productos,
      total,
      cobro,
      responsable,
      notas,
      reporte,
      guia,
    } as Venta);

    return NextResponse.json({
      data: newVenta,
    }, { status: 201 });
  } catch (error) {
    console.error('Create venta error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
