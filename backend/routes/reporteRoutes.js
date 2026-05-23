const express = require('express');
const router  = express.Router();
const { getReporteGanancias, getReporteUsuarios, getReporteEnvios, getEstadisticasHome } = require('../controller/reporteController');

router.get('/ganancias', getReporteGanancias);
router.get('/usuarios',  getReporteUsuarios);
router.get('/envios',    getReporteEnvios);

router.get('/home-stats', getEstadisticasHome);

module.exports = router;
