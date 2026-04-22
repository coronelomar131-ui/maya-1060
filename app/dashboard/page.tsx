'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, Button, Toast, useToast } from '@/components/ui';
import Link from 'next/link';

interface DashboardStats {
  totalVentas: number;
  totalClientes: number;
  totalProductos: number;
  ventasPendientes: number;
  productosBajoStock: number;
  ingresoHoy: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalVentas: 0,
    totalClientes: 0,
    totalProductos: 0,
    ventasPendientes: 0,
    productosBajoStock: 0,
    ingresoHoy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [ventasRes, clientesRes, productoRes] = await Promise.all([
          fetch('/api/ventas').catch(() => null),
          fetch('/api/clientes').catch(() => null),
          fetch('/api/almacen').catch(() => null),
        ]);

        let newStats = { ...stats };

        if (ventasRes?.ok) {
          const ventasData = await ventasRes.json();
          const ventas = Array.isArray(ventasData) ? ventasData : ventasData.data || [];
          newStats.totalVentas = ventas.length;
          newStats.ventasPendientes = ventas.filter(
            (v: any) => v.cobro === 'pendiente'
          ).length;
          newStats.ingresoHoy = ventas
            .filter((v: any) => new Date(v.fecha).toDateString() === new Date().toDateString())
            .reduce((sum: number, v: any) => sum + (v.total || 0), 0);
        }

        if (clientesRes?.ok) {
          const clientesData = await clientesRes.json();
          const clientes = Array.isArray(clientesData) ? clientesData : clientesData.data || [];
          newStats.totalClientes = clientes.length;
        }

        if (productoRes?.ok) {
          const productoData = await productoRes.json();
          const productos = Array.isArray(productoData) ? productoData : productoData.data || [];
          newStats.totalProductos = productos.length;
          newStats.productosBajoStock = productos.filter(
            (p: any) => p.stock <= p.min
          ).length;
        }

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && user) {
      fetchStats();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      label: 'Total Ventas',
      value: stats.totalVentas,
      icon: '💰',
      color: 'bg-blue-100',
      href: '/dashboard/ventas',
    },
    {
      label: 'Clientes',
      value: stats.totalClientes,
      icon: '👥',
      color: 'bg-green-100',
      href: '/dashboard/clientes',
    },
    {
      label: 'Productos',
      value: stats.totalProductos,
      icon: '📦',
      color: 'bg-purple-100',
      href: '/dashboard/almacen',
    },
    {
      label: 'Ventas Pendientes',
      value: stats.ventasPendientes,
      icon: '⏳',
      color: 'bg-orange-100',
      href: '/dashboard/ventas',
    },
    {
      label: 'Bajo Stock',
      value: stats.productosBajoStock,
      icon: '⚠️',
      color: 'bg-red-100',
      href: '/dashboard/almacen',
    },
    {
      label: 'Ingreso Hoy',
      value: `$${stats.ingresoHoy.toFixed(2)}`,
      icon: '📈',
      color: 'bg-yellow-100',
      href: '/dashboard/ventas',
    },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido, {user?.nombre}</h1>
        <p className="text-gray-600 mb-8">
          Hoy es {new Date().toLocaleDateString('es-MX')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className={`${stat.color} cursor-pointer hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card title="Acceso Rápido" subtitle="Módulos principales">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/ventas">
              <Button variant="secondary" className="w-full">
                💰 Ventas
              </Button>
            </Link>
            <Link href="/dashboard/almacen">
              <Button variant="secondary" className="w-full">
                📦 Almacén
              </Button>
            </Link>
            <Link href="/dashboard/clientes">
              <Button variant="secondary" className="w-full">
                👥 Clientes
              </Button>
            </Link>
            <Button variant="ghost" className="w-full">
              ⚙️ Configuración
            </Button>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={toast.onClose}
        />
      )}
    </Layout>
  );
}
