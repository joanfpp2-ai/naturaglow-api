const crypto = require("crypto");

// Autenticacion por API key en la cabecera "x-api-key".
// Si API_KEY no esta definida (desarrollo), no se exige.
function apiKey(req, res, next) {
  const esperada = process.env.API_KEY;
  if (!esperada) return next();

  const recibida = req.get("x-api-key") || "";
  const a = Buffer.from(recibida);
  const b = Buffer.from(esperada);
  // timingSafeEqual evita ataques por tiempo de respuesta
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();

  res.status(401).json({ error: "API key invalida o ausente (cabecera x-api-key)" });
}

module.exports = apiKey;
