const { Schema, model } = require("mongoose");

// Coleccion: actividad (bitacora que alimenta el muro de cada usuaria).
// referencia_id apunta a una publicacion, comentario o me_gusta segun "tipo",
// por eso no se declara una unica referencia fija.
const actividadSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, required: true, enum: ["publicacion", "me_gusta", "comentario"] },
    referencia_id: { type: Schema.Types.ObjectId, required: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "actividad", versionKey: false, strict: "throw" }
);

module.exports = model("Actividad", actividadSchema);
