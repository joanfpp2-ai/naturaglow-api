const mongoose = require("mongoose");

// Traduce los errores de Mongoose/MongoDB a respuestas HTTP claras.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message, detalle: err.detalle });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const detalle = Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ error: "Datos invalidos", detalle });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Valor invalido para "${err.path}"`, detalle: err.value });
  }
  if (err instanceof mongoose.Error.StrictModeError) {
    return res.status(400).json({ error: `Campo no permitido: "${err.path}"` });
  }
  if (err.code === 11000) {
    // indice unico violado (ej. email duplicado) -> E11000 de MongoDB
    return res.status(409).json({ error: "Registro duplicado", detalle: err.keyValue });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON mal formado en el body" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = errorHandler;
