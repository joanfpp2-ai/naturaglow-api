const { Schema, model } = require("mongoose");

// Coleccion: metodos_pago. Esquema flexible: la tarjeta declara marca y
// ultimos_digitos; yape/plin declaran numero. Nunca se guarda la tarjeta completa.
const esTarjeta = function () {
  return this.tipo === "tarjeta";
};

const metodoPagoSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, required: true, enum: ["tarjeta", "yape", "plin"] },
    marca: { type: String, required: esTarjeta, trim: true },
    ultimos_digitos: {
      type: String,
      required: esTarjeta,
      match: [/^\d{4}$/, "ultimos_digitos debe tener exactamente 4 digitos"],
    },
    numero: {
      type: String,
      required: function () {
        return this.tipo === "yape" || this.tipo === "plin";
      },
      match: [/^9\d{8}$/, "numero debe ser un celular peruano de 9 digitos"],
    },
    predeterminado: { type: Boolean, required: true, default: false },
  },
  { collection: "metodos_pago", versionKey: false, strict: "throw" }
);

module.exports = model("MetodoPago", metodoPagoSchema);
