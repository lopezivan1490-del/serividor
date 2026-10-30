// --- Nuevo: inicio (sesion 14: seguridad y autenticacion) ---
// Registro e inicio de sesion con contrasenas cifradas (bcrypt) y tokens JWT.
// La clave para firmar los tokens se lee del .env (JWT_SECRETO), nunca del codigo.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { conectar } = require('./usuariosController');

const RONDAS_BCRYPT = 10;        // costo del hash: mas rondas = mas lento de romper
const DURACION_TOKEN = '1h';     // el token deja de servir despues de 1 hora
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCredenciales(email, password) {
  if (!email || typeof email !== 'string' || !EMAIL_VALIDO.test(email)) {
    return 'El email es obligatorio y debe tener un formato válido';
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return 'La contraseña es obligatoria y debe tener al menos 8 caracteres';
  }
  return null;
}

// POST /registro -> crea una cuenta guardando el hash de la contrasena
async function registrar(req, res) {
  let conexion;
  try {
    const { email, password } = req.body;
    const error = validarCredenciales(email, password);
    if (error) {
      return res.status(400).json({ error });
    }

    // bcrypt agrega una "sal" aleatoria: dos contrasenas iguales dan hashes distintos
    const hash = await bcrypt.hash(password, RONDAS_BCRYPT);

    conexion = await conectar();
    const resultado = await conexion.query(
      'INSERT INTO cuentas (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), hash]
    );
    // Nunca se devuelve el hash en la respuesta
    res.status(201).json({ mensaje: 'Cuenta creada', datos: resultado.rows[0] });

  } catch (error) {
    // 23505 = violacion de UNIQUE en PostgreSQL (el email ya existe)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la cuenta' });
  } finally {
    if (conexion) await conexion.end();
  }
}

// POST /login -> verifica la contrasena y devuelve un token JWT
async function iniciarSesion(req, res) {
  let conexion;
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Debes enviar email y contraseña' });
    }

    conexion = await conectar();
    const { rows: filas } = await conexion.query(
      'SELECT id, email, password_hash FROM cuentas WHERE email = $1',
      [email.toLowerCase()]
    );

    // Mismo mensaje si el email no existe o si la contrasena esta mal:
    // asi un atacante no puede averiguar que emails estan registrados.
    const cuenta = filas[0];
    const coincide = cuenta && await bcrypt.compare(password, cuenta.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: cuenta.id, email: cuenta.email },
      process.env.JWT_SECRETO,
      { expiresIn: DURACION_TOKEN }
    );
    res.json({ mensaje: 'Sesión iniciada', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  } finally {
    if (conexion) await conexion.end();
  }
}

// GET /perfil -> ruta protegida: solo responde si el token es valido
function verPerfil(req, res) {
  // req.cuenta lo agrega el middleware verificarToken
  res.json({ mensaje: 'Acceso permitido', cuenta: req.cuenta });
}

module.exports = { registrar, iniciarSesion, verPerfil };
// --- Nuevo: fin ---