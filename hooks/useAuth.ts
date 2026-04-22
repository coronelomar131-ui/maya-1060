'use client';

import { useState, useEffect } from 'react';
import { Usuario } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (usuario: Usuario) => {
    setUser(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
  };

  return { user, loading, login, logout };
}
