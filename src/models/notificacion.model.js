const { Schema, model } = require("mongoose");

// Coleccion: notificaciones
const notificacionSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, required: true, enum: ["pedido", "social", "promocion"] },
    texto: { type: String, required: true, trim: true },
    leida: { type: Boolean, required: true, default: false },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "notificaciones", versionKey: false, strict: "throw" }
);

module.exports = model("Notificacion", notificacionSchema);
