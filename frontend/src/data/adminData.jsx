export const Ic = {
  grid:     <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  package:  <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  truck:    <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  users:    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  tag:      <svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  supplier: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chart:    <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  archive:  <svg viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  bell:     <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  logout:   <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  shield:   <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  warning:  <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  home:     <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

export const NAV = [
  { key: "dashboard",   label: "Dashboard",       icon: Ic.home,     section: "General" },
  { key: "productos",   label: "Inventario",      icon: Ic.tag,      section: "Catalogo" },
  { key: "catalogo",    label: "Productos",        icon: Ic.grid,     section: "Catalogo" },
  { key: "categorias",  label: "Categorias",       icon: Ic.grid,     section: "Catalogo" },
  { key: "inventario",  label: "Movimiento de Inventario", icon: Ic.archive,  section: "Inventario" },
  { key: "proveedores", label: "Proveedores",      icon: Ic.supplier, section: "Inventario" },
  { key: "compras",     label: "Compras",          icon: Ic.package,  section: "Inventario" },
  { key: "pedidos",     label: "Pedidos",          icon: Ic.package,  section: "Ventas" },
  { key: "envios",      label: "Envios",           icon: Ic.truck,    section: "Ventas" },
  { key: "usuarios",    label: "Usuarios",         icon: Ic.users,    section: "Administracion" },
  { key: "reportes",    label: "Reportes",         icon: Ic.chart,    section: "Administracion" },
];

export const DEMO_PEDIDOS = [
  { id:"#0015", cliente:"Maria Garcia",    fecha:"25 abr 2025", estado:"pendiente", total:"$85.000" },
  { id:"#0014", cliente:"Laura Martinez",  fecha:"24 abr 2025", estado:"enviado",   total:"$42.500" },
  { id:"#0013", cliente:"Sofia Rodriguez", fecha:"23 abr 2025", estado:"entregado", total:"$67.000" },
  { id:"#0012", cliente:"Ana Lopez",       fecha:"22 abr 2025", estado:"pendiente", total:"$120.000" },
  { id:"#0011", cliente:"Paula Rios",      fecha:"21 abr 2025", estado:"enviado",   total:"$38.000" },
];

export const STOCK_BAJO = [
  { nombre:"Gloss Vivai",      cat:"Labios",     qty:3,  level:"critical" },
  { nombre:"Base Ruby Rose",   cat:"Rostro",     qty:5,  level:"critical" },
  { nombre:"Sombras Gloss 14", cat:"Ojos",       qty:8,  level:"low"      },
  { nombre:"Labial Melu",      cat:"Labios",     qty:10, level:"low"      },
];
