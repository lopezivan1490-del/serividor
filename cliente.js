// GET /usuarios -> pide la lista completa de usuarios al servidor y la imprime en consola
fetch('http://localhost:3000/usuarios')
  .then(res => res.json())
  .then(datos => {
    console.log('GET /usuarios ->', datos);

    // POST /usuario -> crea un nuevo usuario (Camila, 22 años) enviando el body en JSON
    return fetch('http://localhost:3000/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Camila', edad: 22 })
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('POST /usuario ->', datos);

    // PUT /usuario/1 -> actualiza la edad del usuario con id 1
    return fetch('http://localhost:3000/usuario/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edad: 23 })
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('PUT /usuario/1 ->', datos);

    // DELETE /usuario/1 -> elimina el usuario con id 1
    return fetch('http://localhost:3000/usuario/1', {
      method: 'DELETE'
    });
  })
  .then(res => res.json())
  .then(datos => {
    console.log('DELETE /usuario/1 ->', datos);

    // GET /usuarios -> confirma que el usuario ya no está
    return fetch('http://localhost:3000/usuarios');
  })
  .then(res => res.json())
  .then(datos => console.log('GET /usuarios ->', datos))
  .catch(err => console.error('Error:', err));
// --- Nuevo: fin ---