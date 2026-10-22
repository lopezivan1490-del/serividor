const express = require('express');
const app = express();
const rutasUsuarios = require('./routes/usuarios');

// --- Nuevo: inicio (sesion 9: formularios tradicionales + JSON) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --- Nuevo: fin ---

app.use('/', rutasUsuarios);

// --- Nuevo: inicio (sesion 10: frontend con Bootstrap) ---
app.use(express.static('public'));
// --- Nuevo: fin ---
const rutasPaises = require('./routes/paises');
app.use('/', rutasPaises);
// --- Nuevo: inicio (sesion 9: middleware de errores global) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});
// --- Nuevo: fin ---

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000');
});

