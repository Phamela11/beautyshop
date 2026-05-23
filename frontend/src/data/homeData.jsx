// SVG icons
export const Ic = {
  search:  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  cart:    <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  heart:   <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  user:    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  plus:    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrow:   <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  lipstick:<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M9 8h6v3l2 2v9H7v-9l2-2V8z"/><line x1="12" y1="8" x2="12" y2="22"/></svg>,
  check:   <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
};

// CATEGORIES now loaded dynamically from API

export const PRODUCTS = [
  { id:1, name:"Gloss Vivai Labial",    cat:"Labios",     price:"$18.000", old:"$24.000", desc:"Gloss hidratante con acabado brillante", badge:"Oferta",  stars:5, reviews:24 },
  { id:2, name:"Base Ruby Rose Silk",   cat:"Rostro",     price:"$35.000", old:null,      desc:"Cobertura media, acabado natural",      badge:"Nuevo",   stars:4, reviews:18 },
  { id:3, name:"Labial Melu Mate",      cat:"Labios",     price:"$22.000", old:"$28.000", desc:"Larga duracion, formula cremosa",       badge:"Oferta",  stars:5, reviews:31 },
  { id:4, name:"Corrector Silk Skin",   cat:"Rostro",     price:"$28.000", old:null,      desc:"Cubre ojeras y manchas suavemente",     badge:null,      stars:4, reviews:12 },
  { id:5, name:"Sombras Gloss 14 ton",  cat:"Ojos",       price:"$42.000", old:"$55.000", desc:"Paleta de 14 colores, alta pigmentacion",badge:"Oferta", stars:5, reviews:47 },
  { id:6, name:"Iluminador Love Rain",  cat:"Iluminador", price:"$31.000", old:null,      desc:"Acabado luminoso natural para el rostro",badge:"Nuevo",  stars:4, reviews:9  },
  { id:7, name:"Delineador Negra",      cat:"Ojos",       price:"$14.000", old:null,      desc:"Punta fina, larga duracion y resistente",badge:null,     stars:4, reviews:22 },
  { id:8, name:"Mascara Volumen Max",   cat:"Ojos",       price:"$26.000", old:"$32.000", desc:"Volumen extremo, formula enriquecida",  badge:"Oferta",  stars:5, reviews:38 },
];