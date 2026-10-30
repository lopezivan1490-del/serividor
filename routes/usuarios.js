const express = require('express');
const router = express.Router();
const { verInicio, obtenerUsuario, crearUsuario, listarUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuariosController');
// --- Nuevo (sesion 14): las rutas que modifican datos exigen token ---
const verificarToken = require('../middleware/verificarToken');

router.get('/', verInicio);
router.get('/usuarios', listarUsuarios);
router.get('/usuarios/:id', obtenerUsuario);
router.post('/usuario', verificarToken, crearUsuario);
// --- Nuevo: inicio ---
router.put('/usuario/:id', verificarToken, actualizarUsuario);
router.delete('/usuario/:id', verificarToken, eliminarUsuario);
// --- Nuevo: fin ---

// --- Nuevo: inicio (rutas en plural /usuarios/:id) ---
// PUT /usuarios/:id -> actualiza los datos de un usuario existente por id
router.put('/usuarios/:id', verificarToken, actualizarUsuario);
// DELETE /usuarios/:id -> elimina un usuario existente por id
router.delete('/usuarios/:id', verificarToken, eliminarUsuario);
// --- Nuevo: fin ---

module.exports = router;