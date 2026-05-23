import { useState, useCallback } from 'react';
import { productService } from '../services/productService';

export const useProveedor = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProveedores();
      setProveedores(data);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError(err.message);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProveedor = useCallback(async (proveedorData) => {
    try {
      await productService.createProveedor(proveedorData);
      await loadProveedores();
      return { success: true };
    } catch (err) {
      console.error('Error creando proveedor:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadProveedores]);

  const updateProveedor = useCallback(async (id_proveedor, proveedorData) => {
    try {
      await productService.updateProveedor(id_proveedor, proveedorData);
      await loadProveedores();
      return { success: true };
    } catch (err) {
      console.error('Error actualizando proveedor:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadProveedores]);

  const deleteProveedor = useCallback(async (id_proveedor) => {
    try {
      await productService.deleteProveedor(id_proveedor);
      await loadProveedores();
      return { success: true };
    } catch (err) {
      console.error('Error eliminando proveedor:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadProveedores]);

  return {
    proveedores,
    loading,
    error,
    loadProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor
  };
};
