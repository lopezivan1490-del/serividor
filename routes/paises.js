// --- Nuevo: inicio (sesion 13: rutas que consumen una API externa) ---
const express = require('express');
const router = express.Router();
const { obtenerPais, obtenerResumen } = require('../controllers/paisesController');

// GET /paises/:nombre -> datos de un pais desde REST Countries
router.get('/paises/:nombre', obtenerPais);
// GET /resumen -> total de usuarios (MySQL) + poblacion de un pais (REST Countries)
router.get('/resumen', obtenerResumen);

module.exports = router;
// --- Nuevo: fin ---