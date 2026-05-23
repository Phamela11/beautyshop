const express = require("express");
const { upload } = require("../config/multer");
const { getProductos, createProducto, updateProducto, deleteProducto } = require("../controller/productoController");

const router = express.Router();

router.get("/", getProductos);
router.post("/", upload.array("imagenes", 5), createProducto);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

module.exports = router;