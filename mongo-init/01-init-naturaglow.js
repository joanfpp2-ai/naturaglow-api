// Se ejecuta UNA sola vez, cuando el volumen de MongoDB esta vacio
// (imagen oficial: /docker-entrypoint-initdb.d). Corre con el usuario root.
//  1) Crea el usuario de la API con privilegio minimo (readWrite sobre NATURAGLOW_DB)
//  2) Crea los indices unicos
//  3) Carga los 47 documentos de las 14 colecciones (mismo modelo de la PC3)

const ng = db.getSiblingDB("NATURAGLOW_DB");

// ---------- 1) Usuario de la aplicacion ----------
ng.createUser({
  user: process.env.MONGO_APP_USER,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: "readWrite", db: "NATURAGLOW_DB" }],
});
print("Usuario de la API creado: " + process.env.MONGO_APP_USER);

// ---------- 2) Indices unicos ----------
ng.usuarios.createIndex({ email: 1 }, { unique: true });
ng.perfiles.createIndex({ usuario_id: 1 }, { unique: true });
ng.perfiles.createIndex({ usuario: 1 }, { unique: true });
ng.inventario.createIndex({ producto_id: 1 }, { unique: true });
ng.promociones.createIndex({ codigo: 1 }, { unique: true });

// ---------- 3) Datos iniciales ----------
const ids = (r) => Object.values(r.insertedIds);

// usuarios (3 clientas + 1 administradora)
const u = ids(
  ng.usuarios.insertMany([
    { nombre: "Ana Torres", email: "ana.torres@mail.com", telefono: "987111222", rol: "cliente", activo: true, fecha_registro: new Date("2026-01-15") },
    { nombre: "Lucia Ramos", email: "lucia.ramos@mail.com", telefono: "987333444", rol: "cliente", activo: true, fecha_registro: new Date("2026-02-03") },
    { nombre: "Camila Vega", email: "camila.vega@mail.com", telefono: "987555666", rol: "cliente", activo: true, fecha_registro: new Date("2026-03-21") },
    { nombre: "Rosa Mendoza", email: "admin@naturaglow.pe", telefono: "987777888", rol: "admin", activo: true, fecha_registro: new Date("2026-01-02") },
  ])
);

// perfiles
ng.perfiles.insertMany([
  { usuario_id: u[0], usuario: "ana_glow", bio: "Piel mixta y amante de la rosa mosqueta", foto: "https://naturaglow.pe/img/perfiles/ana.jpg", tipo_piel: "mixta", seguidores: 2, siguiendo: 1 },
  { usuario_id: u[1], usuario: "lucia_natural", bio: "Rutina capilar sin sulfatos", foto: "https://naturaglow.pe/img/perfiles/lucia.jpg", tipo_piel: "seca", seguidores: 1, siguiendo: 1 },
  { usuario_id: u[2], usuario: "cami_skincare", bio: "Aprendiendo skincare natural", foto: "https://naturaglow.pe/img/perfiles/camila.jpg", tipo_piel: "grasa", seguidores: 0, siguiendo: 1 },
]);

// productos (ingredientes embebidos, longitud variable)
const p = ids(
  ng.productos.insertMany([
    { nombre: "Crema facial de rosa mosqueta", categoria: "Cuidado facial", precio: 45.9, organico: true, envase: "Frasco de vidrio 50 ml", imagen: "https://naturaglow.pe/img/productos/crema-rosa.jpg", ingredientes: ["rosa mosqueta", "aloe vera", "manteca de karite"] },
    { nombre: "Serum de vitamina C", categoria: "Cuidado facial", precio: 59.9, organico: true, envase: "Gotero 30 ml", imagen: "https://naturaglow.pe/img/productos/serum-vitc.jpg", ingredientes: ["vitamina C", "acido hialuronico"] },
    { nombre: "Champu sin sulfatos de romero", categoria: "Cuidado capilar", precio: 38.5, organico: true, envase: "Botella 250 ml", imagen: "https://naturaglow.pe/img/productos/champu-romero.jpg", ingredientes: ["romero", "aceite de coco"] },
    { nombre: "Aceite esencial de lavanda", categoria: "Aromaterapia", precio: 29.9, organico: true, envase: "Gotero ambar 15 ml", imagen: "https://naturaglow.pe/img/productos/aceite-lavanda.jpg", ingredientes: ["lavanda"] },
  ])
);

// inventario
ng.inventario.insertMany([
  { producto_id: p[0], stock: 40, stock_minimo: 10, almacen: "Lima - Surquillo", ultima_reposicion: new Date("2026-11-02") },
  { producto_id: p[1], stock: 25, stock_minimo: 8, almacen: "Lima - Surquillo", ultima_reposicion: new Date("2026-10-28") },
  { producto_id: p[2], stock: 60, stock_minimo: 15, almacen: "Lima - Ate", ultima_reposicion: new Date("2026-11-10") },
  { producto_id: p[3], stock: 12, stock_minimo: 10, almacen: "Lima - Ate", ultima_reposicion: new Date("2026-09-30") },
]);

// publicaciones
const pub = ids(
  ng.publicaciones.insertMany([
    { usuario_id: u[0], producto_id: p[0], texto: "Tres semanas con la crema de rosa mosqueta y mi piel mixta esta mas uniforme", imagen: "https://naturaglow.pe/img/posts/1.jpg", me_gusta: 2, fecha: new Date("2026-11-05T10:15:00Z") },
    { usuario_id: u[1], producto_id: p[2], texto: "Por fin un champu sin sulfatos que no reseca", imagen: "https://naturaglow.pe/img/posts/2.jpg", me_gusta: 1, fecha: new Date("2026-11-08T18:40:00Z") },
    { usuario_id: u[2], producto_id: p[1], texto: "Primer dia usando el serum de vitamina C", imagen: "https://naturaglow.pe/img/posts/3.jpg", me_gusta: 0, fecha: new Date("2026-11-12T08:05:00Z") },
  ])
);

// comentarios
const com = ids(
  ng.comentarios.insertMany([
    { publicacion_id: pub[0], usuario_id: u[1], texto: "Yo tambien la uso, la recomiendo", fecha: new Date("2026-11-05T12:00:00Z") },
    { publicacion_id: pub[1], usuario_id: u[0], texto: "Lo compro en mi siguiente pedido", fecha: new Date("2026-11-08T19:10:00Z") },
    { publicacion_id: pub[0], usuario_id: u[2], texto: "Sirve para piel grasa?", fecha: new Date("2026-11-06T09:30:00Z") },
  ])
);

// me_gusta (intermedia usuarias <-> publicaciones)
const mg = ids(
  ng.me_gusta.insertMany([
    { publicacion_id: pub[0], usuario_id: u[1], fecha: new Date("2026-11-05T11:00:00Z") },
    { publicacion_id: pub[0], usuario_id: u[2], fecha: new Date("2026-11-06T09:25:00Z") },
    { publicacion_id: pub[1], usuario_id: u[0], fecha: new Date("2026-11-08T19:05:00Z") },
  ])
);

// seguidores (intermedia usuarias <-> usuarias)
ng.seguidores.insertMany([
  { seguidor_id: u[1], seguido_id: u[0], fecha: new Date("2026-10-01") },
  { seguidor_id: u[2], seguido_id: u[0], fecha: new Date("2026-10-15") },
  { seguidor_id: u[0], seguido_id: u[1], fecha: new Date("2026-10-20") },
]);

// actividad (muro)
ng.actividad.insertMany([
  { usuario_id: u[0], tipo: "publicacion", referencia_id: pub[0], fecha: new Date("2026-11-05T10:15:00Z") },
  { usuario_id: u[1], tipo: "me_gusta", referencia_id: mg[0], fecha: new Date("2026-11-05T11:00:00Z") },
  { usuario_id: u[0], tipo: "comentario", referencia_id: com[1], fecha: new Date("2026-11-08T19:10:00Z") },
  { usuario_id: u[2], tipo: "publicacion", referencia_id: pub[2], fecha: new Date("2026-11-12T08:05:00Z") },
]);

// metodos_pago (esquema flexible: tarjeta vs yape/plin)
const mp = ids(
  ng.metodos_pago.insertMany([
    { usuario_id: u[0], tipo: "tarjeta", marca: "Visa", ultimos_digitos: "4821", predeterminado: true },
    { usuario_id: u[1], tipo: "yape", numero: "987654321", predeterminado: true },
    { usuario_id: u[2], tipo: "plin", numero: "912345678", predeterminado: true },
  ])
);

// repartidores (el tercero con baja logica)
const r = ids(
  ng.repartidores.insertMany([
    { nombre: "Carlos Quispe", telefono: "999111222", vehiculo: "moto", zona: "Miraflores", activo: true, entregas: 120 },
    { nombre: "Jorge Huaman", telefono: "999333444", vehiculo: "bicicleta", zona: "San Isidro", activo: true, entregas: 85 },
    { nombre: "Pedro Salas", telefono: "999555666", vehiculo: "auto", zona: "Surco", activo: false, entregas: 40 },
  ])
);

// pedidos (referencias + items embebidos)
ng.pedidos.insertMany([
  { usuario_id: u[0], metodo_pago_id: mp[0], repartidor_id: r[0], items: [{ producto_id: p[0], cantidad: 1, precio_unitario: 45.9 }], subtotal: 45.9, envio: 10, total: 55.9, estado: "entregado", direccion: "Av. Larco 345, Miraflores", fecha: new Date("2026-11-01T15:00:00Z"), fecha_pago: new Date("2026-11-01T15:02:00Z") },
  { usuario_id: u[1], metodo_pago_id: mp[1], repartidor_id: r[1], items: [{ producto_id: p[2], cantidad: 1, precio_unitario: 38.5 }, { producto_id: p[3], cantidad: 2, precio_unitario: 29.9 }], subtotal: 98.3, envio: 0, total: 98.3, estado: "enviado", direccion: "Calle Las Begonias 210, San Isidro", fecha: new Date("2026-11-10T20:30:00Z"), fecha_pago: new Date("2026-11-10T20:31:00Z") },
  { usuario_id: u[2], metodo_pago_id: mp[2], repartidor_id: null, items: [{ producto_id: p[1], cantidad: 1, precio_unitario: 59.9 }], subtotal: 59.9, envio: 10, total: 69.9, estado: "pendiente", direccion: "Av. Primavera 1020, Surco", fecha: new Date("2026-11-15T09:45:00Z") },
]);

// promociones (esquema flexible: porcentaje -> categoria, envio -> monto_minimo)
ng.promociones.insertMany([
  { codigo: "BIENVENIDA10", descripcion: "10% en cuidado facial para nuevas clientas", descuento: 10, tipo: "porcentaje", categoria: "Cuidado facial", inicio: new Date("2026-11-01"), fin: new Date("2026-12-31"), activa: true },
  { codigo: "ENVIOGRATIS", descripcion: "Envio gratis en compras desde S/ 80", descuento: 10, tipo: "envio", monto_minimo: 80, inicio: new Date("2026-11-01"), fin: new Date("2026-12-31"), activa: true },
  { codigo: "LAVANDA20", descripcion: "20% en aromaterapia (campana de invierno)", descuento: 20, tipo: "porcentaje", categoria: "Aromaterapia", inicio: new Date("2026-06-01"), fin: new Date("2026-07-31"), activa: false },
]);

// notificaciones
ng.notificaciones.insertMany([
  { usuario_id: u[0], tipo: "pedido", texto: "Tu pedido fue entregado", leida: true, fecha: new Date("2026-11-02T10:00:00Z") },
  { usuario_id: u[0], tipo: "social", texto: "A Lucia le gusto tu publicacion", leida: false, fecha: new Date("2026-11-05T11:00:00Z") },
  { usuario_id: u[1], tipo: "pedido", texto: "Tu pedido esta en camino", leida: false, fecha: new Date("2026-11-11T09:00:00Z") },
  { usuario_id: u[2], tipo: "promocion", texto: "Usa BIENVENIDA10 en tu primera compra", leida: false, fecha: new Date("2026-11-12T08:00:00Z") },
]);

let total = 0;
ng.getCollectionNames().sort().forEach((c) => {
  const n = ng.getCollection(c).countDocuments();
  total += n;
  print(c + ": " + n);
});
print("NATURAGLOW_DB inicializada con " + total + " documentos");
