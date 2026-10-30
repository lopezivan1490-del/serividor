// --- Nuevo: inicio (sesion 14: cliente con autenticacion) ---
// Ahora POST, PUT y DELETE exigen un token. El flujo es:
// registrarse -> iniciar sesion (recibe el token) -> enviar el token en cada peticion protegida
const URL = 'http://localhost:3000';
const credenciales = { email: 'camila@correo.com', password: 'clave-segura-123' };
let token;

// Encabezados para las rutas protegidas: Authorization: Bearer <token>
function encabezados() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

// POST /usuario SIN token -> el servidor responde 401 (no autorizado)
fetch(`${URL}/usuario`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'Intruso', edad: 30 })
})
  .then(res => res.json().then(datos => console.log(`POST /usuario sin token -> ${res.status}`, datos)))
  .then(() => {
    // POST /registro -> crea la cuenta (si ya existe responde 409, y se sigue igual)
    return fetch(`${URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('POST /registro ->', datos);

    // POST /login -> devuelve el token
    return fetch(`${URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('POST /login ->', datos);
    token = datos.token;

    // GET /perfil -> ruta protegida que muestra quien inicio sesion
    return fetch(`${URL}/perfil`, { headers: encabezados() });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('GET /perfil ->', datos);

    // POST /usuario CON token -> crea un nuevo usuario (Camila, 22 años)
    return fetch(`${URL}/usuario`, {
      method: 'POST',
      headers: encabezados(),
      body: JSON.stringify({ nombre: 'Camila', edad: 22 })
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('POST /usuario ->', datos);
    const id = datos.datos.id;

    // PUT /usuario/:id -> actualiza la edad del usuario recien creado
    return fetch(`${URL}/usuario/${id}`, {
      method: 'PUT',
      headers: encabezados(),
      body: JSON.stringify({ edad: 23 })
    })
      .then(res => res.json())
      .then(datos => {
        console.log(`PUT /usuario/${id} ->`, datos);

        // DELETE /usuario/:id -> elimina el usuario recien creado
        return fetch(`${URL}/usuario/${id}`, {
          method: 'DELETE',
          headers: encabezados()
        });
      });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('DELETE /usuario ->', datos);

    // GET /usuarios -> es publica, no necesita token
    return fetch(`${URL}/usuarios`);
  })
  .then(res => res.json())
  .then(datos => console.log('GET /usuarios ->', datos))
  .catch(err => console.error('Error:', err));
// --- Nuevo: fin ---