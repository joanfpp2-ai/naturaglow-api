const { Schema, model } = require("mongoose");

// Coleccion: promociones. Esquema flexible: "porcentaje" declara categoria,
// "envio" declara monto_minimo.
const promocionSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    descuento: { type: Number, required: true, min: 0 },
    tipo: { type: String, required: true, enum: ["porcentaje", "envio"] },
    categoria: {
      type: String,
      trim: true,
      required: function () {
        return this.tipo === "porcentaje";
      },
    },
    monto_minimo: {
      type: Number,
      min: 0,
      required: function () {
        return this.tipo === "envio";
      },
    },
    inicio: { type: Date, required: true },
    fin: {
      type: Date,
      required: true,
      validate: [
        function (v) {
          return !this.inicio || v >= this.inicio;
        },
        "fin debe ser posterior a inicio",
      ],
    },
    activa: { type: Boolean, required: true, default: true },
  },
  { collection: "promociones", versionKey: false, strict: "throw" }
);

module.exports = model("Promocion", promocionSchema);
