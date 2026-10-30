// --- Nuevo: inicio (sesion 13: consumo de APIs externas) ---
// Servicio externo: REST Countries v5 (https://restcountries.com)
// La version v3.1 de la guia ya fue retirada; la v5 pide una API key,
// que se guarda en el archivo .env (CLAVE_API_PAISES) y nunca en el codigo.
const { conectar } = require('./usuariosController');

const BASE_PAISES = 'https://api.restcountries.com/countries/v5';
const PAIS_RESUMEN = 'Colombia';

// Consulta el servicio externo y devuelve solo los datos que nos importan.
// Devuelve null si el pais no existe. Lanza un error con status 502 si el servicio falla.
async function buscarPais(nombre) {
  const campos = 'names.common,capitals,population,region';
  const url = `${BASE_PAISES}/names.common/${encodeURIComponent(nombre)}?response_fields=${campos}`;

  const respuesta = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CLAVE_API_PAISES}` }
  });

  if (respuesta.status === 404) {
    return null;
  }
  if (!respuesta.ok) {
    const error = new Error(`REST Countries respondio ${respuesta.status}`);
    error.status = 502;
    throw error;
  }

  const datos = await respuesta.json();
  const paises = datos.data.objects;
  if (paises.length === 0) {
    return null;
  }

  const pais = paises[0];
  return {
    nombre: pais.names.common,
    capital: pais.capitals.length > 0 ? pais.capitals[0].name : 'Sin capital',
    poblacion: pais.population,
    region: pais.region
  };
}

// GET /paises/:nombre -> nombre comun, capital, poblacion y region
async function obtenerPais(req, res) {
  try {
    const pais = await buscarPais(req.params.nombre);
    if (!pais) {
      return res.status(404).json({ error: `No existe un país llamado "${req.params.nombre}"` });
    }
    res.json(pais);
  } catch (error) {
    console.error(error);
    if (error.status === 502) {
      return res.status(502).json({ error: 'El servicio de países falló' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
}

// GET /resumen -> total de usuarios (dato propio) + poblacion de un pais (dato externo)
async function obtenerResumen(req, res) {
  let conexion;
  try {
    conexion = await conectar();
    const { rows: usuarios } = await conexion.query('SELECT id FROM usuarios');

    const pais = await buscarPais(PAIS_RESUMEN);
    if (!pais) {
      return res.status(404).json({ error: `No existe un país llamado "${PAIS_RESUMEN}"` });
    }

    res.json({
      totalUsuarios: usuarios.length,  // dato propio
      pais: pais.nombre,               // dato externo
      poblacion: pais.poblacion        // dato externo
    });
  } catch (error) {
    console.error(error);
    if (error.status === 502) {
      return res.status(502).json({ error: 'El servicio de países falló' });
    }
    res.status(500).json({ error: 'Error interno' });
  } finally {
    if (conexion) await conexion.end();
  }
}

module.exports = { obtenerPais, obtenerResumen };
// --- Nuevo: fin ---