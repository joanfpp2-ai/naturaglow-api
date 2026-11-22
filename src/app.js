const os = require("os");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const apiKey = require("./middlewares/apiKey");
const errorHandler = require("./middlewares/errorHandler");
const { router, recursos } = require("./routes");
const pkg = require("../package.json");

const app = express();

// ---- Middleware de seguridad e integracion ----
app.use(helmet()); // cabeceras HTTP seguras
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // permite el acceso desde la capa de presentacion
app.use(express.json({ limit: "100kb" })); // body JSON con tamano maximo
app.use(morgan(":date[iso] :method :url :status :response-time ms")); // log de cada peticion

// ---- Rutas publicas ----
app.get("/", (req, res) => {
  res.json({
    servicio: "NaturaGlow API REST - Capa de aplicacion",
    version: pkg.version,
    endpoints: recursos.map((r) => `/api/${r}`),
    salud: "/api/health",
  });
});

const ESTADOS_DB = ["desconectado", "conectado", "conectando", "desconectando"];
app.get("/api/health", async (req, res) => {
  const conectado = mongoose.connection.readyState === 1;
  let ping = null;
  if (conectado) {
    const t = Date.now();
    await mongoose.connection.db.admin().ping();
    ping = `${Date.now() - t} ms`;
  }
  res.status(conectado ? 200 : 503).json({
    estado: conectado ? "ok" : "error",
    contenedor: os.hostname(), // id del contenedor Docker
    base_datos: {
      estado: ESTADOS_DB[mongoose.connection.readyState],
      host: mongoose.connection.host,
      nombre: mongoose.connection.name,
      ping,
    },
    uptime_s: Math.round(process.uptime()),
  });
});

// ---- Rutas protegidas: limite de peticiones + API key ----
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api", apiKey, router);

app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

module.exports = app;
