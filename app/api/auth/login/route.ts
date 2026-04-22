import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioByUsername } from '@/lib/supabase-server';
import { createToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, pin } = body;

    // Validate input
    if (!usuario || !pin) {
      return NextResponse.json(
        { error: 'usuario and pin are required' },
        { status: 400 }
      );
    }

    // Find user by username
    const foundUser = await getUsuarioByUsername(usuario);

    if (!foundUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!foundUser.activo) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 401 }
      );
    }

    // Verify PIN
    if (foundUser.pin !== pin) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createToken(foundUser);

    // Return user and token
    const response = NextResponse.json({
      user: {
        id: foundUser.id,
        nombre: foundUser.nombre,
        usuario: foundUser.usuario,
        rol: foundUser.rol,
      },
      token,
    });

    // Set token in cookie for optional use
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
