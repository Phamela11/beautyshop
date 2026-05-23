export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE = `${API_ORIGIN}/api`;

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
