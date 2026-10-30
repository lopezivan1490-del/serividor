const express = require('express');
const app = express();
const rutasUsuarios = require('./routes/usuarios');

// --- Nuevo: inicio (sesion 9: formularios tradicionales + JSON) ---
app.use(express.json({ limit: '10kb' }));  // sesion 14: limita el tamano del body
app.use(express.urlencoded({ extended: true }));
// --- Nuevo: fin ---

app.use('/', rutasUsuarios);

// --- Nuevo: inicio (sesion 13: APIs externas) ---
const rutasPaises = require('./routes/paises');
app.use('/', rutasPaises);
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 14: seguridad y autenticacion) ---
// Sin la clave para firmar tokens el login no puede funcionar: se detiene el servidor
if (!process.env.JWT_SECRETO) {
  console.error('Falta JWT_SECRETO en el archivo .env');
  process.exit(1);
}
app.disable('x-powered-by');  // no revelar que el servidor usa Express
const rutasAuth = require('./routes/auth');
app.use('/', rutasAuth);
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 10: frontend con Bootstrap) ---
app.use(express.static('public'));
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 9: middleware de errores global) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});
// --- Nuevo: fin ---

app.listen(3000, () => {
  console.log('Escuchando en el puerto 3000');
});