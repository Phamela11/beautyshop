export const Ic = {
  search:   <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  heart:    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  eye:      <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  cart:     <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  plus:     <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  lipstick: <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M9 8h6v3l2 2v9H7v-9l2-2V8z"/><line x1="12" y1="8" x2="12" y2="22"/></svg>,
  check:    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  box:      <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
};

// CATEGORIAS now loaded dynamically from API

export const PRODUCTOS = [
  { id:1, name:"Gloss Vivai Labial",    cat:"Labios",    price:18000, old:24000, desc:"Gloss hidratante con acabado brillante y larga duracion. Formula enriquecida con vitamina E para mantener tus labios suaves e hidratados todo el dia.", badge:"Oferta", stars:5, reviews:24, stock:15 },
  { id:2, name:"Base Ruby Rose Silk",   cat:"Rostro",    price:35000, old:null,  desc:"Cobertura media con acabado natural. Formula ligera que se funde con la piel para un look sin maquillaje. Apta para todo tipo de piel.", badge:"Nuevo", stars:4, reviews:18, stock:8  },
  { id:3, name:"Labial Melu Mate",      cat:"Labios",    price:22000, old:28000, desc:"Labial de larga duracion con formula cremosa y acabado mate. Disponible en 12 tonos. No reseca los labios.", badge:"Oferta", stars:5, reviews:31, stock:20 },
  { id:4, name:"Corrector Silk Skin",   cat:"Rostro",    price:28000, old:null,  desc:"Cubre ojeras y manchas suavemente con acabado natural. Formula de larga duracion resistente al agua.", badge:null, stars:4, reviews:12, stock:5  },
  { id:5, name:"Sombras Gloss 14 ton",  cat:"Ojos",      price:42000, old:55000, desc:"Paleta de 14 colores con alta pigmentacion. Incluye tonos mates y brillantes. Formula de larga duracion.", badge:"Oferta", stars:5, reviews:47, stock:12 },
  { id:6, name:"Iluminador Love Rain",  cat:"Iluminador",price:31000, old:null,  desc:"Iluminador en polvo con acabado luminoso natural. Disponible en 3 tonos: dorado, rosado y champagne.", badge:"Nuevo", stars:4, reviews:9,  stock:18 },
  { id:7, name:"Delineador Precision",  cat:"Ojos",      price:14000, old:null,  desc:"Delineador de punta fina con tinta de larga duracion y resistencia al agua. Trazo preciso y uniforme.", badge:null, stars:4, reviews:22, stock:30 },
  { id:8, name:"Mascara Volumen Max",   cat:"Ojos",      price:26000, old:32000, desc:"Mascara de pestanas con formula de volumen extremo. Cepillo curvo que separa y alarga cada pestana.", badge:"Oferta", stars:5, reviews:38, stock:7  },
];