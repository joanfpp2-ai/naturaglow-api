const { Schema, model } = require("mongoose");

// Colecciones intermedias (relaciones muchos a muchos). NO se exponen como
// recurso REST: solo se modelan para que la API pueda verificar integridad
// referencial (por ejemplo, impedir borrar una publicacion con me_gusta).

// me_gusta: usuarias <-> publicaciones
const meGustaSchema = new Schema(
  {
    publicacion_id: { type: Schema.Types.ObjectId, ref: "Publicacion", required: true },
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "me_gusta", versionKey: false, strict: "throw" }
);

// seguidores: usuarias <-> usuarias
const seguidorSchema = new Schema(
  {
    seguidor_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    seguido_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "seguidores", versionKey: false, strict: "throw" }
);

module.exports = {
  MeGusta: model("MeGusta", meGustaSchema),
  Seguidor: model("Seguidor", seguidorSchema),
};
