// --- Nuevo: inicio (sesion 14: rutas de autenticacion) ---
const express = require('express');
const router = express.Router();
const { registrar, iniciarSesion, verPerfil } = require('../controllers/authController');
const verificarToken = require('../middleware/verificarToken');

// POST /registro -> crea una cuenta { email, password }
router.post('/registro', registrar);
// POST /login -> devuelve un token JWT { email, password }
router.post('/login', iniciarSesion);
// GET /perfil -> ruta protegida, requiere Authorization: Bearer <token>
router.get('/perfil', verificarToken, verPerfil);

module.exports = router;
// --- Nuevo: fin ---