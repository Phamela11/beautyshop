const API_BASE = "https://beautyshop-production.up.railway.app/api";

export const userService = {
  async getUsuarios() {
    try {
      const response = await fetch(`${API_BASE}/usuarios`);
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getUsuarios:', error);
      throw error;
    }
  },

  async getUsuarioById(id) {
    try {
      const response = await fetch(`${API_BASE}/usuarios/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener usuario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getUsuarioById:', error);
      throw error;
    }
  }
};