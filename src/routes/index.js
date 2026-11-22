const { Router } = require("express");
const crudRouter = require("../lib/crudRouter");

// Se cargan TODOS los modelos (incluidas las intermedias) para que la
// verificacion de integridad referencial los conozca.
require("../models/intermedias.model");

// Colecciones expuestas como recurso REST (12 de 14).
// me_gusta y seguidores son intermedias (muchos a muchos) y no se exponen.
const recursos = {
  usuarios: require("../models/usuario.model"),
  perfiles: require("../models/perfil.model"),
  productos: require("../models/producto.model"),
  inventario: require("../models/inventario.model"),
  publicaciones: require("../models/publicacion.model"),
  comentarios: require("../models/comentario.model"),
  actividad: require("../models/actividad.model"),
  pedidos: require("../models/pedido.model"),
  "metodos-pago": require("../models/metodoPago.model"),
  repartidores: require("../models/repartidor.model"),
  promociones: require("../models/promocion.model"),
  notificaciones: require("../models/notificacion.model"),
};

const router = Router();
for (const [ruta, Model] of Object.entries(recursos)) {
  router.use(`/${ruta}`, crudRouter(Model));
}

module.exports = { router, recursos: Object.keys(recursos) };
