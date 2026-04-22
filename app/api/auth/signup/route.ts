import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioByUsername, createUsuario, getUsuarios } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Check authorization - only admin can create users
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
        { error: 'Solo administradores pueden crear usuarios' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nombre, usuario, pin, rol } = body;

    // Validate required fields
    if (!nombre || !usuario || !pin || !rol) {
      return NextResponse.json(
        { error: 'nombre, usuario, pin, and rol are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'user'].includes(rol)) {
      return NextResponse.json(
        { error: 'rol must be "admin" or "user"' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await getUsuarioByUsername(usuario);

    if (existingUser) {
      return NextResponse.json(
        { error: 'usuario already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await createUsuario({
      id: 0, // Will be set by createUsuario
      nombre,
      usuario,
      pin,
      rol,
      activo: true,
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        usuario: newUser.usuario,
        rol: newUser.rol,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
