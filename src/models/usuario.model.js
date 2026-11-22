const { Schema, model } = require("mongoose");

// Coleccion: usuarios
const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // indice unico (mismo control que en la PC3)
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "email no valido"],
    },
    telefono: { type: String, required: true, trim: true },
    rol: { type: String, required: true, enum: ["cliente", "admin"], default: "cliente" },
    activo: { type: Boolean, required: true, default: true },
    fecha_registro: { type: Date, required: true, default: Date.now },
  },
  { collection: "usuarios", versionKey: false, strict: "throw" }
);

module.exports = model("Usuario", usuarioSchema);
