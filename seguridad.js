const bcrypt = require('bcryptjs');

async function probar() {
    const a = await bcrypt.hash('clave12345', 10);
    const b = await bcrypt.hash('clave12345', 10);
    console.log(a)
    console.log(b)
    console.log('¿son iguales?', a === b)
    console.log('clave correcta:', await bcrypt.compare ('clave12345', a))
    console.log('clave incorrecta:', await bcrypt.compare('otraClave', a)) 
}

probar()
