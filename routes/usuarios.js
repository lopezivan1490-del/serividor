const express = require('express');
const router = express.Router();
const { verInicio, obtenerUsuario, crearUsuario, listarUsuarios, actualizarUsuario, eliminarUsuario } = require('../controllers/usuariosController');

router.get('/', verInicio);
router.get('/usuarios', listarUsuarios);
router.get('/usuarios/:id', obtenerUsuario);
router.post('/usuario', crearUsuario);
// --- Nuevo: inicio ---
router.put('/usuario/:id', actualizarUsuario);
router.delete('/usuario/:id', eliminarUsuario);
// --- Nuevo: fin ---

// --- Nuevo: inicio (rutas en plural /usuarios/:id) ---
// PUT /usuarios/:id -> actualiza los datos de un usuario existente por id
router.put('/usuarios/:id', actualizarUsuario);
// DELETE /usuarios/:id -> elimina un usuario existente por id
router.delete('/usuarios/:id', eliminarUsuario);
// --- Nuevo: fin ---

module.exports = router;