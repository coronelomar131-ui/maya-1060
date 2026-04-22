'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-[#37474F] text-white shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">Maya Autopartes</h1>
          <p className="text-sm text-gray-300">Gestión de Inventario</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <p className="font-semibold">{user.nombre}</p>
                <p className="text-xs text-gray-300 capitalize">{user.rol}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-[#263238]"
              >
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
