// SVG icons
export const Icons = {
  home:     <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  grid:     <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  cart:     <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  package:  <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  star:     <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  user:     <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:   <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  bell:     <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  box:      <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
};

export const NAV_ITEMS = [
  { key: "dashboard", label: "Inicio",          icon: Icons.home    },
  { key: "catalogo",  label: "Catalogo",         icon: Icons.grid    },
  { key: "carrito",   label: "Mi carrito",       icon: Icons.cart,  badge: 0 },
  { key: "pedidos",   label: "Mis pedidos",      icon: Icons.package },
  { key: "resenas",   label: "Mis reseñas",      icon: Icons.star    },
  { key: "perfil",    label: "Mi perfil",        icon: Icons.user    },
];

export const DEMO_PEDIDOS = [
  { id: "#0012", fecha: "20 abr 2025", estado: "entregado", total: "$85.000" },
  { id: "#0011", fecha: "10 abr 2025", estado: "enviado",   total: "$42.500" },
  { id: "#0009", fecha: "01 abr 2025", estado: "pendiente", total: "$120.000" },
];

export const DEMO_PRODUCTOS = [
  { nombre: "Gloss Vivai",    precio: "$18.000" },
  { nombre: "Base Ruby Rose", precio: "$35.000" },
  { nombre: "Labial Melu",    precio: "$22.000" },
  { nombre: "Corrector Silk", precio: "$28.000" },
];