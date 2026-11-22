const { Schema, model } = require("mongoose");

// Coleccion: perfiles (perfil publico de cada usuaria, 1 a 1 con usuarios)
const perfilSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },
    usuario: { type: String, required: true, unique: true, trim: true }, // nombre de usuario publico
    bio: { type: String, default: "" },
    foto: { type: String, default: "" },
    tipo_piel: {
      type: String,
      required: true,
      enum: ["seca", "grasa", "mixta", "normal", "sensible"],
    },
    seguidores: { type: Number, required: true, default: 0, min: 0 },
    siguiendo: { type: Number, required: true, default: 0, min: 0 },
  },
  { collection: "perfiles", versionKey: false, strict: "throw" }
);

module.exports = model("Perfil", perfilSchema);
