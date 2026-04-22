import { Usuario } from '@/types';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  userId: number;
  usuario: string;
  rol: string;
  iat: number;
  exp: number;
}

/**
 * Create a simple JWT token
 */
export function createToken(user: Usuario): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    userId: user.id,
    usuario: user.usuario,
    rol: user.rol,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(message)
    .digest('base64url');

  return `${message}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const message = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(message)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from request headers
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}
