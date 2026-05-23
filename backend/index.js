const productoRoutes   = require("./routes/productoRoutes");
const proveedorRoutes  = require("./routes/proveedorRoutes");
const compraRoutes     = require("./routes/compraRoutes");
const inventarioRoutes = require("./routes/inventarioRoutes");
const pagoRoutes       = require("./routes/pagoRoutes");

 
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();
 
app.use(cors());
app.use(express.json());
app.use('/api/productos',  productoRoutes);
app.use('/api/categorias', require('./routes/categoriaRoutes'));
app.use('/api/proveedores',proveedorRoutes);
app.use('/api/compras',    compraRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/pedidos',    require('./routes/pedidoRoutes'));
app.use('/api/carrito',    require('./routes/carritoRoutes'));
app.use('/api/pagos',      pagoRoutes);
app.use('/api/usuarios',   require('./routes/usuarioRoutes'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/envios',     require('./routes/envioRoutes'));
app.use('/api/resenas',    require('./routes/resenaRoutes'));
app.use('/api/reportes',   require('./routes/reporteRoutes'));
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Servidor en puerto ${PORT}`));