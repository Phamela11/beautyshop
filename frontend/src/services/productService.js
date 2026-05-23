import { API_BASE } from './apiConfig';

export const productService = {
  // Obtener todos los productos
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE}/productos`);
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getProducts:', error);
      throw error;
    }
  },

  // Obtener todas las categorías
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE}/categorias`);
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }
  },

  // Crear una nueva categoría
  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Error al crear categoría');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createCategory:', error);
      throw error;
    }
  },

  // Actualizar categoría
  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`${API_BASE}/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar categoría');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateCategory:', error);
      throw error;
    }
  },

  // Eliminar categoría
  async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE}/categorias/${id}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      const responseJson = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        const errorMessage = responseJson?.error || 'Error al eliminar categoría';
        throw new Error(errorMessage);
      }

      return responseJson;
    } catch (error) {
      console.error('Error en deleteCategory:', error);
      throw error;
    }
  },

  // Crear un nuevo producto con imágenes
  async createProduct(productData, images) {
    try {
      const formData = new FormData();

      // Agregar datos del producto
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });

      // Agregar imágenes
      images.forEach((file) => {
        formData.append('imagenes', file);
      });

      const response = await fetch(`${API_BASE}/productos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        let responseJson = null;
        try {
          responseJson = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseJson = null;
        }
        throw new Error(responseJson?.error || 'Error al crear producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  },

  // Actualizar producto (si se necesita en el futuro)
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let responseJson = null;
        try {
          responseJson = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseJson = null;
        }
        throw new Error(responseJson?.error || 'Error al actualizar producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  },

  // Eliminar producto (si se necesita en el futuro)
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_BASE}/productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const responseText = await response.text();
        let responseJson = null;
        try {
          responseJson = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseJson = null;
        }
        throw new Error(responseJson?.error || 'Error al eliminar producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  },

  // ==================== PROVEEDORES ====================

  // Obtener todos los proveedores
  async getProveedores() {
    try {
      const response = await fetch(`${API_BASE}/proveedores`);
      if (!response.ok) {
        throw new Error('Error al obtener proveedores');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getProveedores:', error);
      throw error;
    }
  },

  // Crear un nuevo proveedor
  async createProveedor(proveedorData) {
    try {
      const response = await fetch(`${API_BASE}/proveedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });

      if (!response.ok) {
        throw new Error('Error al crear proveedor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createProveedor:', error);
      throw error;
    }
  },

  // Actualizar proveedor
  // Actualizar proveedor
  async updateProveedor(id_proveedor, proveedorData) {
    try {
      const response = await fetch(`${API_BASE}/proveedores/${id_proveedor}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar proveedor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateProveedor:', error);
      throw error;
    }
  },

  // Eliminar proveedor
  async deleteProveedor(id_proveedor) {
    try {
      const response = await fetch(`${API_BASE}/proveedores/${id_proveedor}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      const responseJson = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        const errorMessage = responseJson?.error || 'Error al eliminar proveedor';
        throw new Error(errorMessage);
      }

      return responseJson;
    } catch (error) {
      console.error('Error en deleteProveedor:', error);
      throw error;
    }
  },

  // Obtener lotes de inventario
  async getLotesInventario() {
    try {
      const response = await fetch(`${API_BASE}/inventario`);
      if (!response.ok) {
        throw new Error('Error al obtener lotes de inventario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getLotesInventario:', error);
      throw error;
    }
  },

  // Obtener lotes de un producto específico
  async getLotesProducto(id_producto) {
    try {
      const response = await fetch(`${API_BASE}/inventario/producto/${id_producto}`);
      if (!response.ok) {
        throw new Error('Error al obtener lotes del producto');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getLotesProducto:', error);
      throw error;
    }
  },

  // Obtener movimientos de inventario
  async getMovimientosInventario() {
    try {
      const response = await fetch(`${API_BASE}/inventario/movimientos`);
      if (!response.ok) {
        throw new Error('Error al obtener movimientos de inventario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getMovimientosInventario:', error);
      throw error;
    }
  },

  // Obtener movimientos de un producto específico
  async getMovimientosProducto(id_producto) {
    try {
      const response = await fetch(`${API_BASE}/inventario/movimientos/producto/${id_producto}`);
      if (!response.ok) {
        throw new Error('Error al obtener movimientos del producto');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getMovimientosProducto:', error);
      throw error;
    }
  },

  // Obtener todas las compras
  async getCompras() {
    try {
      const response = await fetch(`${API_BASE}/compras`);
      if (!response.ok) {
        throw new Error('Error al obtener compras');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getCompras:', error);
      throw error;
    }
  },

  // Obtener una compra específica con detalles
  async getCompra(id_compra) {
    try {
      const response = await fetch(`${API_BASE}/compras/${id_compra}`);
      if (!response.ok) {
        throw new Error('Error al obtener compra');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getCompra:', error);
      throw error;
    }
  },

  // Crear una nueva compra con detalles
  async createCompra(compraData) {
    try {
      const response = await fetch(`${API_BASE}/compras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compraData),
      });

      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) {
        throw new Error(json?.error || 'Error al crear compra');
      }

      return json;
    } catch (error) {
      console.error('Error en createCompra:', error);
      throw error;
    }
  },

  // Actualizar compra
  async updateCompra(id_compra, compraData) {
    try {
      const response = await fetch(`${API_BASE}/compras/${id_compra}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compraData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar compra');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateCompra:', error);
      throw error;
    }
  },

  // Eliminar compra
  async deleteCompra(id_compra) {
    try {
      const response = await fetch(`${API_BASE}/compras/${id_compra}`, {
        method: 'DELETE',
      });

      const responseText = await response.text();
      const responseJson = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        const errorMessage = responseJson?.error || 'Error al eliminar compra';
        throw new Error(errorMessage);
      }

      return responseJson;
    } catch (error) {
      console.error('Error en deleteCompra:', error);
      throw error;
    }
  },

  // Obtener pedidos
  async getPedidos() {
    try {
      const response = await fetch(`${API_BASE}/pedidos`);
      if (!response.ok) {
        throw new Error('Error al obtener pedidos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getPedidos:', error);
      throw error;
    }
  },

  async getPedidosUsuario(id_usuario) {
    try {
      const response = await fetch(`${API_BASE}/pedidos/usuario/${id_usuario}`);
      if (!response.ok) {
        throw new Error('Error al obtener pedidos del usuario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getPedidosUsuario:', error);
      throw error;
    }
  },

  // Crear pedido con aplicación FIFO de inventario
  async createPedido(pedidoData) {
    try {
      const response = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
      });

      const responseText = await response.text();
      let responseJson = null;
      try {
        responseJson = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseJson = null;
      }

      if (!response.ok) {
        throw new Error(responseJson?.error || 'Error al crear pedido');
      }

      return responseJson;
    } catch (error) {
      console.error('Error en createPedido:', error);
      throw error;
    }
  },

  async checkoutCarrito(id_usuario) {
    try {
      const response = await fetch(`${API_BASE}/pedidos/checkout/${id_usuario}`, {
        method: 'POST'
      });
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(json?.error || 'Error al procesar compra');
      return json;
    } catch (error) {
      console.error('Error en checkoutCarrito:', error);
      throw error;
    }
  },

  async updateEstadoPedido(id_pedido, estado) {
    try {
      const response = await fetch(`${API_BASE}/pedidos/${id_pedido}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(json?.error || 'Error al actualizar estado');
      return json;
    } catch (error) {
      console.error('Error en updateEstadoPedido:', error);
      throw error;
    }
  },

  // Simular validación FIFO para una venta
  async simularVentaFIFO(id_producto, cantidad) {
    try {
      const response = await fetch(`${API_BASE}/pedidos/simular-venta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_producto, cantidad }),
      });

      const responseText = await response.text();
      let responseJson = null;
      try {
        responseJson = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseJson = null;
      }

      if (!response.ok) {
        throw new Error(responseJson?.error || 'Error al simular venta FIFO');
      }

      return responseJson;
    } catch (error) {
      console.error('Error en simularVentaFIFO:', error);
      throw error;
    }
  },

  async getCarrito(id_usuario) {
    try {
      const response = await fetch(`${API_BASE}/carrito/${id_usuario}`);
      if (!response.ok) throw new Error('Error al obtener carrito');
      return await response.json();
    } catch (error) {
      console.error('Error en getCarrito:', error);
      throw error;
    }
  },

  async addToCarrito(id_usuario, id_producto, cantidad = 1) {
    try {
      const response = await fetch(`${API_BASE}/carrito/${id_usuario}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto, cantidad })
      });
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(json?.error || 'Error al agregar al carrito');
      return json;
    } catch (error) {
      console.error('Error en addToCarrito:', error);
      throw error;
    }
  },

  async updateCarritoItem(id_usuario, id_producto, cantidad) {
    try {
      const response = await fetch(`${API_BASE}/carrito/${id_usuario}/items/${id_producto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(json?.error || 'Error al actualizar carrito');
      return json;
    } catch (error) {
      console.error('Error en updateCarritoItem:', error);
      throw error;
    }
  },
  async registrarPago({ id_pedido, metodo_pago, estado_pago = 'completado' }) {
    try {
      const response = await fetch(`${API_BASE}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pedido,
          metodo_pago,
          estado_pago,
          fecha_pago: new Date().toISOString(),
        }),
      });
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      if (!response.ok) throw new Error(json?.error || 'Error al registrar pago');
      return json;
    } catch (error) {
      console.error('Error en registrarPago:', error);
      throw error;
    }
  },

  async getResenasUsuario(id_usuario) {
    const response = await fetch(`${API_BASE}/resenas/usuario/${id_usuario}`);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.error || 'Error al obtener reseñas');
    }
    return json;
  },

  async getResenasProducto(id_producto) {
    const response = await fetch(`${API_BASE}/resenas/producto/${id_producto}`);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.error || 'Error al obtener reseñas del producto');
    }
    return json;
  },

  async createResena(payload) {
    const response = await fetch(`${API_BASE}/resenas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(json.error || 'No se pudo publicar la reseña');
    }
    return json;
  },

};
