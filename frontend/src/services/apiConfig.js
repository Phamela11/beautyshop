export const API_ORIGIN =
  import.meta.env.VITE_API_URL || 'https://beautyshop-production.up.railway.app';

export const API_BASE = `${API_ORIGIN}/api`;

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};