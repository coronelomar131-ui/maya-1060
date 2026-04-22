import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioByUsername } from '@/lib/supabase-server';
import { verifyToken, extractToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user details from database
    const user = await getUsuarioByUsername(payload.usuario);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Return user info (without PIN)
    return NextResponse.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
