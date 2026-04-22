'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, Button, Input, Table, Modal, Toast, useToast } from '@/components/ui';
import { Cliente } from '@/types';

export default function ClientesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (!loading && user) {
      fetchClientes();
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = clientes;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.telefono?.includes(searchTerm)
      );
    }

    setFilteredClientes(filtered);
  }, [clientes, searchTerm]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const data = await response.json();
        const clientesArray = Array.isArray(data) ? data : data.data || [];
        setClientes(clientesArray);
      }
    } catch (error) {
      showToast('Error cargando clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCliente ? 'PUT' : 'POST';
      const url = editingCliente
        ? `/api/clientes/${editingCliente.id}`
        : '/api/clientes';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingCliente ? 'Cliente actualizado' : 'Cliente creado',
          'success'
        );
        setIsModalOpen(false);
        resetForm();
        fetchClientes();
      }
    } catch (error) {
      showToast('Error guardando cliente', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Cliente eliminado', 'success');
        fetchClientes();
      }
    } catch (error) {
      showToast('Error eliminando cliente', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      empresa: '',
      email: '',
      telefono: '',
      direccion: '',
      notas: '',
    });
    setEditingCliente(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      empresa: cliente.empresa || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      notas: cliente.notas || '',
    });
    setIsModalOpen(true);
  };

  const handleNewCliente = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'empresa', label: 'Empresa', width: '150px' },
    { key: 'email', label: 'Email', width: '180px' },
    { key: 'telefono', label: 'Teléfono', width: '120px' },
  ];

  const tableData = filteredClientes.map((c) => ({
    ...c,
    empresa: c.empresa || '-',
    email: c.email || '-',
    telefono: c.telefono || '-',
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <Button variant="primary" onClick={handleNewCliente}>
            + Nuevo Cliente
          </Button>
        </div>

        <Card className="mb-6">
          <Input
            placeholder="Buscar por nombre, empresa, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    handleEdit(
                      clientes.find((c) => c.id === row.id) || ({} as Cliente)
                    )
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
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              {editingCliente ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          <Input
            label="Empresa"
            type="text"
            value={formData.empresa}
            onChange={(e) =>
              setFormData({ ...formData, empresa: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <Input
            label="Teléfono"
            type="tel"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
          />
          <Input
            label="Dirección"
            type="text"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
          />
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
