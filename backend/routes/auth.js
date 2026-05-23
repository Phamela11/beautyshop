// routes/auth.js
// Requiere: npm install express mysql2 bcrypt jsonwebtoken

const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const db      = require("../db");

const SALT_ROUNDS = 10;
const JWT_SECRET  = process.env.JWT_SECRET || "cambia_esto_en_produccion";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { nombre, correo, contrasena, direccion } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ message: "Nombre, correo y contrasena son requeridos." });
  }
  if (contrasena.length < 6) {
    return res.status(400).json({ message: "La contrasena debe tener al menos 6 caracteres." });
  }

  try {
    const [existe] = await db.query(
      "SELECT id_usuario FROM usuario WHERE correo = ?",
      [correo]
    );
    if (existe.length > 0) {
      return res.status(409).json({ message: "Este correo ya esta registrado." });
    }

    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    const [roles] = await db.query(
      "SELECT id_rol FROM rol WHERE nombre = ?",
      ["cliente"]
    );

    let id_rol;
    if (roles.length === 0) {
      const [insertRole] = await db.query(
        "INSERT INTO rol (nombre) VALUES (?)",
        ["cliente"]
      );
      id_rol = insertRole.insertId;
    } else {
      id_rol = roles[0].id_rol;
    }

    const [result] = await db.query(
      `INSERT INTO usuario (nombre, correo, contrasena, direccion, id_rol)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, hash, direccion || null, id_rol]
    );

    res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: { id_usuario: result.insertId, nombre, correo }
    });

  } catch (err) {
    console.error("Error en /register:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: "Correo y contrasena son requeridos." });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, r.nombre AS rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "El correo electronico o la contrasena son incorrectos." });
    }

    const user = rows[0];

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) {
      return res.status(401).json({ message: "El correo electronico o la contrasena son incorrectos." });
    }

    const token = jwt.sign(
      { id: user.id_usuario, correo: user.correo, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol:    user.rol,
    });

  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

module.exports = router;
