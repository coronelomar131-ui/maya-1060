'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Card, Button, Input, Table, Modal, Toast, useToast } from '@/components/ui';
import { Producto } from '@/types';

export default function AlmacenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'todos' | 'bajo' | 'normal'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    precio: 0,
    stock: 0,
    costo: 0,
    categoria: '',
    min: 0,
    max: 0,
    notas: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (!loading && user) {
      fetchProductos();
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = productos;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStock === 'bajo') {
      filtered = filtered.filter((p) => p.stock <= p.min);
    } else if (filterStock === 'normal') {
      filtered = filtered.filter((p) => p.stock > p.min);
    }

    setFilteredProductos(filtered);
  }, [productos, searchTerm, filterStock]);

  const fetchProductos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/almacen');
      if (response.ok) {
        const data = await response.json();
        const productosArray = Array.isArray(data) ? data : data.data || [];
        setProductos(productosArray);
      }
    } catch (error) {
      showToast('Error cargando productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProducto ? 'PUT' : 'POST';
      const url = editingProducto
        ? `/api/almacen/${editingProducto.id}`
        : '/api/almacen';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          editingProducto ? 'Producto actualizado' : 'Producto creado',
          'success'
        );
        setIsModalOpen(false);
        resetForm();
        fetchProductos();
      }
    } catch (error) {
      showToast('Error guardando producto', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const response = await fetch(`/api/almacen/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Producto eliminado', 'success');
        fetchProductos();
      }
    } catch (error) {
      showToast('Error eliminando producto', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      sku: '',
      precio: 0,
      stock: 0,
      costo: 0,
      categoria: '',
      min: 0,
      max: 0,
      notas: '',
    });
    setEditingProducto(null);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      sku: producto.sku,
      precio: producto.precio,
      stock: producto.stock,
      costo: producto.costo,
      categoria: producto.categoria,
      min: producto.min,
      max: producto.max,
      notas: producto.notas || '',
    });
    setIsModalOpen(true);
  };

  const handleNewProducto = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const getStockColor = (producto: Producto) => {
    if (producto.stock <= producto.min) return 'bg-red-100 text-red-800';
    if (producto.stock <= producto.min * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'sku', label: 'SKU', width: '120px' },
    { key: 'categoria', label: 'Categoría', width: '120px' },
    { key: 'stock', label: 'Stock', width: '100px' },
    { key: 'precio', label: 'Precio', width: '100px' },
  ];

  const tableData = filteredProductos.map((p) => ({
    ...p,
    precio: `$${p.precio.toFixed(2)}`,
    stock: (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStockColor(p)}`}>
        {p.stock} / {p.max}
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
          <h1 className="text-3xl font-bold text-gray-900">Almacén</h1>
          <Button variant="primary" onClick={handleNewProducto}>
            + Nuevo Producto
          </Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterStock}
              onChange={(e) =>
                setFilterStock(e.target.value as 'todos' | 'bajo' | 'normal')
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
            >
              <option value="todos">Todos los productos</option>
              <option value="bajo">Stock bajo</option>
              <option value="normal">Stock normal</option>
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
                    handleEdit(
                      productos.find((p) => p.id === row.id) || ({} as Producto)
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
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
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
              {editingProducto ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
            label="SKU"
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
            required
          />
          <Input
            label="Categoría"
            type="text"
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) =>
                setFormData({ ...formData, precio: parseFloat(e.target.value) })
              }
              required
            />
            <Input
              label="Costo"
              type="number"
              step="0.01"
              value={formData.costo}
              onChange={(e) =>
                setFormData({ ...formData, costo: parseFloat(e.target.value) })
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Stock Actual"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) })
              }
              required
            />
            <Input
              label="Mínimo"
              type="number"
              value={formData.min}
              onChange={(e) =>
                setFormData({ ...formData, min: parseInt(e.target.value) })
              }
              required
            />
            <Input
              label="Máximo"
              type="number"
              value={formData.max}
              onChange={(e) =>
                setFormData({ ...formData, max: parseInt(e.target.value) })
              }
              required
            />
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
