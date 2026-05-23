import { useState, useCallback } from 'react';
import { productService } from '../services/productService';

export const useCompra = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCompras();
      setCompras(data);
    } catch (err) {
      console.error('Error cargando compras:', err);
      setError(err.message);
      setCompras([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompra = useCallback(async (compraData) => {
    try {
      await productService.createCompra(compraData);
      await loadCompras();
      return { success: true };
    } catch (err) {
      console.error('Error creando compra:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadCompras]);

  const updateCompra = useCallback(async (id_compra, compraData) => {
    try {
      await productService.updateCompra(id_compra, compraData);
      await loadCompras();
      return { success: true };
    } catch (err) {
      console.error('Error actualizando compra:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadCompras]);

  const deleteCompra = useCallback(async (id_compra) => {
    try {
      await productService.deleteCompra(id_compra);
      await loadCompras();
      return { success: true };
    } catch (err) {
      console.error('Error eliminando compra:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadCompras]);

  return {
    compras,
    loading,
    error,
    loadCompras,
    createCompra,
    updateCompra,
    deleteCompra
  };
};
