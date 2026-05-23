import { useCallback, useState } from 'react';
import { productService } from '../services/productService';

export const usePedidoFIFO = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const obtenerLotesFIFO = useCallback(async (productoId) => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await productService.simularVentaFIFO(productoId, 1);
      return resultado.lotes || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const procesarVenta = useCallback(async (productoId, cantidad, idUsuario = 1, precioUnitario = 0) => {
    setLoading(true);
    setError(null);
    try {
      const pedido = await productService.createPedido({
        id_usuario: idUsuario,
        detalles: [
          {
            id_producto: productoId,
            cantidad,
            precio_unitario: precioUnitario
          }
        ]
      });
      return pedido;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const crearPedido = useCallback(async (pedidoData) => {
    setLoading(true);
    setError(null);
    try {
      return await productService.createPedido(pedidoData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    obtenerLotesFIFO,
    procesarVenta,
    crearPedido
  };
};
