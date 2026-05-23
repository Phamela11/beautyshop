import { useState, useCallback } from 'react';
import { productService } from '../services/productService';

export const useInventario = () => {
  const [lotes, setLotes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLotesInventario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getLotesInventario();
      setLotes(data);
    } catch (err) {
      console.error('Error cargando lotes de inventario:', err);
      setError(err.message);
      setLotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLotesProducto = useCallback(async (id_producto) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getLotesProducto(id_producto);
      setLotes(data);
    } catch (err) {
      console.error('Error cargando lotes del producto:', err);
      setError(err.message);
      setLotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMovimientosInventario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getMovimientosInventario();
      setMovimientos(data);
    } catch (err) {
      console.error('Error cargando movimientos de inventario:', err);
      setError(err.message);
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMovimientosProducto = useCallback(async (id_producto) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getMovimientosProducto(id_producto);
      setMovimientos(data);
    } catch (err) {
      console.error('Error cargando movimientos del producto:', err);
      setError(err.message);
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lotes,
    movimientos,
    loading,
    error,
    loadLotesInventario,
    loadLotesProducto,
    loadMovimientosInventario,
    loadMovimientosProducto
  };
};