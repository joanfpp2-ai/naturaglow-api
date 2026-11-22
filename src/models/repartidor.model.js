const { Schema, model } = require("mongoose");

// Coleccion: repartidores ("activo: false" = baja logica)
const repartidorSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    vehiculo: { type: String, required: true, enum: ["moto", "bicicleta", "auto"] },
    zona: { type: String, required: true, trim: true },
    activo: { type: Boolean, required: true, default: true },
    entregas: { type: Number, required: true, default: 0, min: 0 },
  },
  { collection: "repartidores", versionKey: false, strict: "throw" }
);

module.exports = model("Repartidor", repartidorSchema);
