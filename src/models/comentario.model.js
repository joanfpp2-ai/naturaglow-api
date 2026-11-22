const { Schema, model } = require("mongoose");

// Coleccion: comentarios (tiene contenido propio -> si se expone por la API)
const comentarioSchema = new Schema(
  {
    publicacion_id: { type: Schema.Types.ObjectId, ref: "Publicacion", required: true },
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    texto: { type: String, required: true, trim: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "comentarios", versionKey: false, strict: "throw" }
);

module.exports = model("Comentario", comentarioSchema);
