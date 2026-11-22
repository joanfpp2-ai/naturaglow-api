const { Schema, model } = require("mongoose");

// Coleccion: inventario (stock separado de la ficha del producto)
const inventarioSchema = new Schema(
  {
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto", required: true, unique: true },
    stock: { type: Number, required: true, min: 0 },
    stock_minimo: { type: Number, required: true, min: 0 },
    almacen: { type: String, required: true, trim: true },
    ultima_reposicion: { type: Date, required: true, default: Date.now },
  },
  { collection: "inventario", versionKey: false, strict: "throw" }
);

module.exports = model("Inventario", inventarioSchema);
