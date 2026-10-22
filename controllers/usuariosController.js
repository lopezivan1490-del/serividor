// --- Nuevo: inicio (sesion 11: conexion a MySQL) ---
const mysql = require('mysql2/promise');

async function conectar() {
  const conexion = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || 'TU_CONTRASEÑA_AQUI',
    database: 'curso_web'
  });
  return conexion;
}
// --- Nuevo: fin ---

function verInicio(req, res) {
  res.send('Servidor funcionando');
}

// --- Nuevo: inicio (sesion 12: GET /usuarios/:id lee de la base de datos) ---
async function obtenerUsuario(req, res) {
  let conexion;
  try {
    conexion = await conectar();
    // El ? evita inyeccion SQL: mysql2 escapa el valor por nosotros
    const [filas] = await conexion.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(filas[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  } finally {
    if (conexion) await conexion.end();
  }
}
// --- Nuevo: fin ---


// --- Nuevo: inicio (sesion 12: POST /usuario guarda en la base de datos) ---
async function crearUsuario(req, res) {
  let conexion;
  try {
    const { nombre, edad } = req.body;

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser texto' });
    }
    if (edad === undefined || typeof edad !== 'number' || Number.isNaN(edad)) {
      return res.status(400).json({ error: 'La edad es obligatoria y debe ser un número' });
    }
    if (edad < 0) {
      return res.status(400).json({ error: 'La edad no puede ser negativa' });
    }

    conexion = await conectar();
    const [resultado] = await conexion.query(
      'INSERT INTO usuarios (nombre, edad) VALUES (?, ?)',
      [nombre, edad]
    );
    const nuevoUsuario = { id: resultado.insertId, nombre, edad };
    res.status(201).json({ mensaje: 'Usuario creado', datos: nuevoUsuario });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar en la base de datos' });
  } finally {
    if (conexion) await conexion.end();
  }
}
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 11: GET /usuarios lee de la base de datos) ---
async function listarUsuarios(req, res) {
  let conexion;
  try {
    conexion = await conectar();
    const [filas] = await conexion.query('SELECT * FROM usuarios');
    res.json(filas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  } finally {
    if (conexion) await conexion.end();
  }
}
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 12: PUT /usuario/:id actualiza en la base de datos) ---
async function actualizarUsuario(req, res) {
  let conexion;
  try {
    const { nombre, edad } = req.body;

    if (nombre === undefined && edad === undefined) {
      return res.status(400).json({ error: 'Debes enviar al menos un dato para actualizar' });
    }
    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '')) {
      return res.status(400).json({ error: 'El nombre debe ser un texto no vacío' });
    }
    if (edad !== undefined && (typeof edad !== 'number' || Number.isNaN(edad) || edad < 0)) {
      return res.status(400).json({ error: 'La edad debe ser un número mayor o igual a 0' });
    }

    conexion = await conectar();
    const [filas] = await conexion.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si un campo no llega en el body, se conserva el valor actual
    const usuario = {
      id: filas[0].id,
      nombre: nombre ?? filas[0].nombre,
      edad: edad ?? filas[0].edad
    };
    await conexion.query(
      'UPDATE usuarios SET nombre = ?, edad = ? WHERE id = ?',
      [usuario.nombre, usuario.edad, usuario.id]
    );
    res.json({ mensaje: 'Usuario actualizado', datos: usuario });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar en la base de datos' });
  } finally {
    if (conexion) await conexion.end();
  }
}
// --- Nuevo: fin ---

// --- Nuevo: inicio (sesion 12: DELETE /usuario/:id elimina de la base de datos) ---
async function eliminarUsuario(req, res) {
  let conexion;
  try {
    conexion = await conectar();
    const [resultado] = await conexion.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    // affectedRows = 0 significa que no existia un usuario con ese id
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar en la base de datos' });
  } finally {
    if (conexion) await conexion.end();
  }
}
// --- Nuevo: fin ---

module.exports = { verInicio, obtenerUsuario, crearUsuario,
                   listarUsuarios, actualizarUsuario, eliminarUsuario,
                   // --- Nuevo (sesion 13): se exporta para usarla en /resumen ---
                   conectar };