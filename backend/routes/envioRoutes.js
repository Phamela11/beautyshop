const express = require('express');
const router = express.Router();
const { getEnvios, updateEstadoEnvio, updateEnvioLogistica } = require('../controller/envioController');

router.get('/', getEnvios);
router.put('/:id_envio/estado', updateEstadoEnvio);
router.put('/:id_envio/logistica', updateEnvioLogistica);

module.exports = router;
