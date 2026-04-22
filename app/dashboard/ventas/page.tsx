'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, Button, Input, Table, Modal, Toast, useToast } from '@/components/ui';
import { Venta } from '@/types';

export default function VentasPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCobro, setFilterCobro] = useState<'todos' | 'cobrado' | 'pendiente'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [formData, setFormData] = useState<{
    fecha: string;
    cliente: string;
    total: number;
    cobro: 'cobrado' | 'pendiente';
    notas: string;
  }>({
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    total: 0,
    cobro: 'pendiente',
    notas: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (!loading && user) {
      fetchVentas();
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = ventas;

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.id.toString().includes(searchTerm)
      );
    }

    if (filterCobro !== 'todos') {
      filtered = filtered.filter((v) => v.cobro === filterCobro);
    }

    setFilteredVentas(filtered);
  }, [ventas, searchTerm, filterCobro]);

  const fetchVentas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ventas');
      if (response.ok) {
        const data = await response.json();
        const ventasArray = Array.isArray(data) ? data : data.data || [];
        setVentas(ventasArray);
      }
    } catch (error) {
      showToast('Error cargando ventas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingVenta ? 'PUT' : 'POST';
      const url = editingVenta
        ? `/api/ventas/${editingVenta.id}`
        : '/api/ventas';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          responsable: user?.nombre,
          productos: [],
        }),
      });

      if (response.ok) {
        showToast(
          editingVenta ? 'Venta actualizada' : 'Venta creada',
          'success'
        );
        setIsModalOpen(false);
        resetForm();
        fetchVentas();
      }
    } catch (error) {
      showToast('Error guardando venta', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta venta?')) return;
    try {
      const response = await fetch(`/api/ventas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Venta eliminada', 'success');
        fetchVentas();
      }
    } catch (error) {
      showToast('Error eliminando venta', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      cliente: '',
      total: 0,
      cobro: 'pendiente',
      notas: '',
    });
    setEditingVenta(null);
  };

  const handleEdit = (venta: Venta) => {
    setEditingVenta(venta);
    setFormData({
      fecha: venta.fecha,
      cliente: venta.cliente,
      total: venta.total,
      cobro: venta.cobro,
      notas: venta.notas || '',
    });
    setIsModalOpen(true);
  };

  const handleNewVenta = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'fecha', label: 'Fecha', width: '120px' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'total', label: 'Total', width: '120px' },
    {
      key: 'cobro',
      label: 'Estado',
      width: '120px',
    },
  ];

  const tableData = filteredVentas.map((v) => ({
    ...v,
    total: `$${v.total.toFixed(2)}`,
    cobro: (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          v.cobro === 'cobrado'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {v.cobro === 'cobrado' ? 'Cobrado' : 'Pendiente'}
      </span>
    ),
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <Button variant="primary" onClick={handleNewVenta}>
            + Nueva Venta
          </Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar por cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterCobro}
              onChange={(e) =>
                setFilterCobro(e.target.value as 'todos' | 'cobrado' | 'pendiente')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            >
              <option value="todos">Todos los estados</option>
              <option value="cobrado">Cobrado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </Card>

        <Card>
          <Table
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            actions={(row) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    handleEdit(ventas.find((v) => v.id === row.id) || ({} as Venta))
                  }
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(row.id)}
                >
                  Eliminar
                </Button>
              </div>
            )}
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingVenta ? 'Editar Venta' : 'Nueva Venta'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingVenta ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cliente"
            type="text"
            value={formData.cliente}
            onChange={(e) =>
              setFormData({ ...formData, cliente: e.target.value })
            }
            required
          />
          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
          <Input
            label="Total"
            type="number"
            step="0.01"
            value={formData.total}
            onChange={(e) =>
              setFormData({ ...formData, total: parseFloat(e.target.value) })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Cobro
            </label>
            <select
              value={formData.cobro}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cobro: e.target.value as 'cobrado' | 'pendiente',
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            >
              <option value="pendiente">Pendiente</option>
              <option value="cobrado">Cobrado</option>
            </select>
          </div>
          <Input
            label="Notas"
            type="text"
            value={formData.notas}
            onChange={(e) =>
              setFormData({ ...formData, notas: e.target.value })
            }
          />
        </form>
      </Modal>

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
