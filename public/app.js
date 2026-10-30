const contenedor = document.querySelector('#contenedor-usuarios');
const formUsuario = document.querySelector('#formUsuario');
const mensaje = document.querySelector('#mensaje');

// --- Nuevo: inicio (sesion 14: seguridad y autenticacion) ---
const formLogin = document.querySelector('#formLogin');
const btnRegistro = document.querySelector('#btnRegistro');
const btnSalir = document.querySelector('#btnSalir');
const estadoSesion = document.querySelector('#estadoSesion');

// Muestra un aviso usando textContent: el texto nunca se interpreta como HTML (evita XSS)
function mostrarAviso(texto, tipo) {
  mensaje.innerHTML = '';
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto;
  mensaje.appendChild(alerta);
}

function actualizarEstadoSesion() {
  const email = localStorage.getItem('email');
  estadoSesion.textContent = email ? `Sesión iniciada como ${email}` : 'No has iniciado sesión';
  btnSalir.classList.toggle('d-none', !email);
}

// Envia email y contrasena a /registro o /login
function enviarCredenciales(ruta) {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  return fetch(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json().then(datos => ({ ok: res.ok, datos })));
}

formLogin.addEventListener('submit', (evento) => {
  evento.preventDefault();
  enviarCredenciales('/login')
    .then(({ ok, datos }) => {
      if (!ok) {
        return mostrarAviso(datos.error, 'danger');
      }
      // El token se guarda en el navegador y se envia en cada peticion protegida
      localStorage.setItem('token', datos.token);
      localStorage.setItem('email', document.querySelector('#email').value);
      formLogin.reset();
      actualizarEstadoSesion();
      mostrarAviso(datos.mensaje, 'success');
    })
    .catch(err => console.error('Error al iniciar sesión:', err));
});

btnRegistro.addEventListener('click', () => {
  if (!formLogin.reportValidity()) return;
  enviarCredenciales('/registro')
    .then(({ ok, datos }) => {
      mostrarAviso(ok ? `${datos.mensaje}. Ahora inicia sesión.` : datos.error, ok ? 'success' : 'danger');
    })
    .catch(err => console.error('Error al registrarse:', err));
});

btnSalir.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  actualizarEstadoSesion();
  mostrarAviso('Sesión cerrada', 'secondary');
});
// --- Nuevo: fin ---

function cargarUsuarios() {
  fetch('/usuarios')
    .then(res => res.json())
    .then(usuarios => {
      contenedor.innerHTML = '';
      // --- Nuevo (sesion 14): los datos del usuario van con textContent, no dentro del HTML ---
      usuarios.forEach(usuario => {
        const columna = document.createElement('div');
        columna.className = 'col-12 col-md-6 col-lg-4';
        columna.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title"></h5>
              <p class="card-text"></p>
            </div>
          </div>
        `;
        columna.querySelector('.card-title').textContent = usuario.nombre;
        columna.querySelector('.card-text').textContent = `Edad: ${usuario.edad}`;
        contenedor.appendChild(columna);
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
    headers: {
      'Content-Type': 'application/json',
      // --- Nuevo (sesion 14): crear usuarios exige el token del login ---
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ nombre, edad })
  })
    .then(res => res.json().then(datos => ({ ok: res.ok, datos })))
    .then(({ ok, datos }) => {
      if (!ok) {
        mostrarAviso(datos.error, 'danger');
        return;
      }
      mostrarAviso(datos.mensaje, 'success');
      formUsuario.reset();
      cargarUsuarios();
    })
    .catch(err => console.error('Error al crear usuario:', err));
});

actualizarEstadoSesion();
cargarUsuarios();