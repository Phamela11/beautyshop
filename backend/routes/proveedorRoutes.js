const express = require('express');
const {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor
} = require('../controller/proveedorController');

const router = express.Router();

router.get('/', getProveedores);
router.get('/:id_proveedor', getProveedor);
router.post('/', createProveedor);
router.put('/:id_proveedor', updateProveedor);
router.delete('/:id_proveedor', deleteProveedor);

module.exports = router;
