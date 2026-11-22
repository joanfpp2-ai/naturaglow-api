const { Schema, model } = require("mongoose");

// Subdocumento embebido: items[] (no es una coleccion, viaja dentro del pedido)
const itemSchema = new Schema(
  {
    producto_id: { type: Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precio_unitario: { type: Number, required: true, min: 0 }, // precio vigente al comprar
  },
  { _id: false, strict: "throw" }
);

// Coleccion: pedidos
const pedidoSchema = new Schema(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    metodo_pago_id: { type: Schema.Types.ObjectId, ref: "MetodoPago", required: true },
    repartidor_id: { type: Schema.Types.ObjectId, ref: "Repartidor", default: null }, // puede no estar asignado
    items: {
      type: [itemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, "el pedido debe tener al menos un item"],
    },
    subtotal: { type: Number, min: 0 },
    envio: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, min: 0 },
    estado: {
      type: String,
      required: true,
      enum: ["pendiente", "pagado", "enviado", "entregado", "cancelado"],
      default: "pendiente",
    },
    direccion: { type: String, required: true, trim: true },
    fecha: { type: Date, required: true, default: Date.now },
    fecha_pago: { type: Date }, // solo existe cuando el pedido se paga
  },
  { collection: "pedidos", versionKey: false, strict: "throw" }
);

// Logica de negocio en la capa de aplicacion: subtotal y total se calculan
// a partir de los items, el cliente no puede enviarlos manipulados.
pedidoSchema.pre("validate", function () {
  const subtotal = (this.items || []).reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.total = Math.round((this.subtotal + (this.envio || 0)) * 100) / 100;
  if (this.estado === "pagado" && !this.fecha_pago) this.fecha_pago = new Date();
});

module.exports = model("Pedido", pedidoSchema);
