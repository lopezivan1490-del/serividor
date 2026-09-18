const contenedor = document.querySelector('#contenedor-usuarios');
const formUsuario = document.querySelector('#formUsuario');
const mensaje = document.querySelector('#mensaje');

function cargarUsuarios() {
  fetch('/usuarios')
    .then(res => res.json())
    .then(usuarios => {
      contenedor.innerHTML = '';
      usuarios.forEach(usuario => {
        contenedor.innerHTML += `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">${usuario.nombre}</h5>
                <p class="card-text">Edad: ${usuario.edad}</p>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(err => console.error('Error al cargar usuarios:', err));
}

formUsuario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = document.querySelector('#nombre').value;
  const edad = Number(document.querySelector('#edad').value);

  fetch('/usuario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, edad })
  })
    .then(res => res.json().then(datos => ({ ok: res.ok, datos })))
    .then(({ ok, datos }) => {
      if (!ok) {
        mensaje.innerHTML = `<div class="alert alert-danger">${datos.error}</div>`;
        return;
      }
      mensaje.innerHTML = `<div class="alert alert-success">${datos.mensaje}</div>`;
      formUsuario.reset();
      cargarUsuarios();
    })
    .catch(err => console.error('Error al crear usuario:', err));
});

cargarUsuarios();