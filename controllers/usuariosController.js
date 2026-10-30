// --- Nuevo: inicio (conexion a Supabase / PostgreSQL) ---
// Los datos de conexion se leen del archivo .env (nunca en el codigo).
// Se copian de Supabase: boton "Connect" > "Session pooler".
const { Client } = require('pg');

async function conectar() {
  const conexion = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }  // Supabase exige conexion cifrada
  });
  await conexion.connect();
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
    // El $1 evita inyeccion SQL: pg envia el valor por separado de la consulta
    const { rows: filas } = await conexion.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
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
    // RETURNING id devuelve el id generado (en MySQL era insertId)
    const resultado = await conexion.query(
      'INSERT INTO usuarios (nombre, edad) VALUES ($1, $2) RETURNING id',
      [nombre, edad]
    );
    const nuevoUsuario = { id: resultado.rows[0].id, nombre, edad };
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
    const { rows: filas } = await conexion.query('SELECT * FROM usuarios ORDER BY id');
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
    const { rows: filas } = await conexion.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
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
      'UPDATE usuarios SET nombre = $1, edad = $2 WHERE id = $3',
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
    const resultado = await conexion.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    // rowCount = 0 significa que no existia un usuario con ese id
    if (resultado.rowCount === 0) {
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