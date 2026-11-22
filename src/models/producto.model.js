const { Schema, model } = require("mongoose");

// Coleccion: productos (catalogo; ingredientes embebidos como arreglo)
const productoSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    organico: { type: Boolean, required: true, default: false },
    envase: { type: String, required: true, trim: true },
    imagen: { type: String, default: "" },
    ingredientes: { type: [String], required: true, default: [] },
  },
  { collection: "productos", versionKey: false, strict: "throw" }
);

module.exports = model("Producto", productoSchema);
