require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const conectarDB = require("./config/db");

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/NATURAGLOW_DB";

async function main() {
  await conectarDB(MONGO_URI);
  const server = app.listen(PORT, () => console.log(`NaturaGlow API escuchando en el puerto ${PORT}`));

  // Apagado ordenado cuando Docker envia SIGTERM (docker stop / compose down)
  const apagar = async (senal) => {
    console.log(`${senal} recibido, cerrando...`);
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => apagar("SIGTERM"));
  process.on("SIGINT", () => apagar("SIGINT"));
}

main().catch((err) => {
  console.error("No se pudo iniciar la API:", err.message);
  process.exit(1);
});
