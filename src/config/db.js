const mongoose = require("mongoose");

async function conectarDB(uri, intentos = 10) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      const { host, port, name } = mongoose.connection;
      console.log(`MongoDB conectado -> ${host}:${port}/${name}`);
      return;
    } catch (err) {
      console.error(`Intento ${i}/${intentos} de conexion a MongoDB fallido: ${err.message}`);
      if (i === intentos) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

module.exports = conectarDB;
