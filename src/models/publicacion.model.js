const { Schema, model } = require("mongoose");

// Coleccion: publicaciones (componente social)
const publicacionSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    texto: { type: String, required: true, trim: true },
    imagen: { type: String, default: "" },
    me_gusta: { type: Number, required: true, default: 0, min: 0 }, // contador desnormalizado
    fecha: { type: Date, required: true, default: Date.now },
  },
  { collection: "publicaciones", versionKey: false, strict: "throw" }
);

module.exports = model("Publicacion", publicacionSchema);
