'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, Toast, useToast } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast, showToast } = useToast();
  const [usuario, setUsuario] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ usuario?: string; pin?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!usuario.trim()) newErrors.usuario = 'Usuario es requerido';
    if (!pin.trim()) newErrors.pin = 'PIN es requerido';
    if (pin.trim().length !== 4 || !/^\d+$/.test(pin)) {
      newErrors.pin = 'PIN debe ser 4 dígitos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, pin }),
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.message || 'Error de autenticación', 'error');
        return;
      }

      const data = await response.json();
      login(data.user);
      showToast('Bienvenido ' + data.user.nombre, 'success');
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#37474F] to-[#263238] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maya Autopartes</h1>
          <p className="text-gray-600">Sistema de Gestión de Inventario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            type="text"
            value={usuario}
            onChange={(e) => {
              setUsuario(e.target.value);
              setErrors({ ...errors, usuario: '' });
            }}
            error={errors.usuario}
            placeholder="Ingresa tu usuario"
            disabled={isLoading}
          />

          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              handlePinChange(e.target.value);
              setErrors({ ...errors, pin: '' });
            }}
            error={errors.pin}
            placeholder="• • • •"
            maxLength={4}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Demo: usuario <strong>admin</strong>, pin <strong>1234</strong>
          </p>
        </div>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={toast.onClose}
        />
      )}
    </div>
  );
}
