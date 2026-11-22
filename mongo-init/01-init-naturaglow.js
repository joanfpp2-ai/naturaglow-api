// Se ejecuta UNA sola vez, cuando el volumen de MongoDB esta vacio
// (imagen oficial: /docker-entrypoint-initdb.d). Corre con el usuario root.
//  1) Crea las 14 colecciones de NATURAGLOW_DB
//  2) Crea el usuario de la API con privilegio minimo (readWrite sobre NATURAGLOW_DB)
//  3) Crea los indices unicos
//  4) Carga los 47 documentos de la PC3 (mismos datos del script naturaglow_mongo.js)

const ng = db.getSiblingDB("NATURAGLOW_DB");

// ---------- 1) Colecciones ----------
[
  "usuarios", "perfiles", "productos", "inventario", "publicaciones", "comentarios", "me_gusta",
  "seguidores", "actividad", "pedidos", "metodos_pago", "repartidores", "promociones", "notificaciones",
].forEach((c) => ng.createCollection(c));

// ---------- 2) Usuario de la aplicacion ----------
ng.createUser({
  user: process.env.MONGO_APP_USER,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: "readWrite", db: "NATURAGLOW_DB" }],
});
print("Usuario de la API creado: " + process.env.MONGO_APP_USER);

// ---------- 3) Indices unicos ----------
ng.usuarios.createIndex({ email: 1 }, { unique: true });
ng.perfiles.createIndex({ usuario_id: 1 }, { unique: true });
ng.perfiles.createIndex({ usuario: 1 }, { unique: true });
ng.inventario.createIndex({ producto_id: 1 }, { unique: true });
ng.promociones.createIndex({ codigo: 1 }, { unique: true });

// ---------- 4) Datos de la PC3 ----------
const ids = (r) => Object.values(r.insertedIds);

// usuarios
const u = ids(ng.usuarios.insertMany([
  { nombre: "Ana Torres",    email: "ana.torres@mail.com",    telefono: "987654321",
    rol: "cliente", activo: true,  fecha_registro: new Date("2026-01-15") },
  { nombre: "Luis Ramirez",  email: "luis.ramirez@mail.com",  telefono: "987654322",
    rol: "cliente", activo: true,  fecha_registro: new Date("2026-02-10") },
  { nombre: "Camila Vega",   email: "camila.vega@mail.com",   telefono: "987654323",
    rol: "cliente", activo: true,  fecha_registro: new Date("2026-02-20") },
  { nombre: "Lucia Paredes", email: "admin@naturaglow.pe",    telefono: "941252892",
    rol: "admin",   activo: true,  fecha_registro: new Date("2026-01-02") },
]));

// perfiles (el perfil publico de cada usuaria)
ng.perfiles.insertMany([
  { usuario_id: u[0], usuario: "@anatorres", bio: "Rutina simple, ingredientes que puedo nombrar.",
    foto: "img/perfiles/ana.jpg",    tipo_piel: "mixta", seguidores: 128, siguiendo: 34 },
  { usuario_id: u[1], usuario: "@luisr",     bio: "Probando cosmetica natural desde 2025.",
    foto: "img/perfiles/luis.jpg",   tipo_piel: "grasa", seguidores: 56,  siguiendo: 91 },
  { usuario_id: u[2], usuario: "@camivega",  bio: "Amante de la lavanda y los rituales de noche.",
    foto: "img/perfiles/camila.jpg", tipo_piel: "seca",  seguidores: 240, siguiendo: 12 },
]);

// productos (catalogo de NaturaGlow)
const p = ids(ng.productos.insertMany([
  { nombre: "Crema facial de aloe vera",  categoria: "Cuidado facial", precio: 45.90,
    organico: true,  envase: "tarro",   imagen: "img/productos/1.jpg",
    ingredientes: ["aloe vera", "glicerina vegetal", "vitamina E"] },
  { nombre: "Serum de vitamina C",        categoria: "Cuidado facial", precio: 68.50,
    organico: true,  envase: "gotero",  imagen: "img/productos/2.jpg",
    ingredientes: ["acido ascorbico", "acido hialuronico"] },
  { nombre: "Shampoo de romero",          categoria: "Cuidado capilar", precio: 38.00,
    organico: true,  envase: "botella", imagen: "img/productos/3.jpg",
    ingredientes: ["extracto de romero", "aceite de ricino"] },
  { nombre: "Aceite esencial de lavanda", categoria: "Aromaterapia",   precio: 28.00,
    organico: true,  envase: "gotero",  imagen: "img/productos/9.jpg",
    ingredientes: ["lavandula angustifolia"] },
]));

// inventario (el stock vive aparte del catalogo)
ng.inventario.insertMany([
  { producto_id: p[0], stock: 30, stock_minimo: 10, almacen: "Lima Centro", ultima_reposicion: new Date("2026-10-20") },
  { producto_id: p[1], stock: 20, stock_minimo: 8,  almacen: "Lima Centro", ultima_reposicion: new Date("2026-10-22") },
  { producto_id: p[2], stock: 40, stock_minimo: 12, almacen: "Lima Sur",    ultima_reposicion: new Date("2026-10-18") },
  { producto_id: p[3], stock: 45, stock_minimo: 15, almacen: "Lima Sur",    ultima_reposicion: new Date("2026-10-25") },
]);

// publicaciones (las clientas comparten su rutina)
const pub = ids(ng.publicaciones.insertMany([
  { usuario_id: u[0], producto_id: p[0],
    texto: "Tres semanas con la crema de aloe y la piel aguanta mucho mejor el verano.",
    imagen: "img/feed/post1.jpg", me_gusta: 42, fecha: new Date("2026-10-28T09:20:00Z") },
  { usuario_id: u[2], producto_id: p[3],
    texto: "Dos gotas de lavanda en la almohada y listo. Mi ritual de noche.",
    imagen: "img/feed/post2.jpg", me_gusta: 87, fecha: new Date("2026-10-29T21:05:00Z") },
  { usuario_id: u[1], producto_id: p[2],
    texto: "El shampoo de romero no hace espuma y al principio desconfie. Un mes despues, recomendado.",
    imagen: "img/feed/post3.jpg", me_gusta: 19, fecha: new Date("2026-11-01T14:40:00Z") },
]));

// comentarios
ng.comentarios.insertMany([
  { publicacion_id: pub[0], usuario_id: u[2], texto: "Yo tambien la uso, deja la piel suave.", fecha: new Date("2026-10-28T11:00:00Z") },
  { publicacion_id: pub[1], usuario_id: u[0], texto: "Lo voy a probar, gracias por el dato.",  fecha: new Date("2026-10-30T08:15:00Z") },
  { publicacion_id: pub[2], usuario_id: u[2], texto: "A mi me paso igual con la espuma.",      fecha: new Date("2026-11-01T18:30:00Z") },
]);

// me_gusta (intermedia usuarias <-> publicaciones)
ng.me_gusta.insertMany([
  { publicacion_id: pub[0], usuario_id: u[1], fecha: new Date("2026-10-28T10:10:00Z") },
  { publicacion_id: pub[0], usuario_id: u[2], fecha: new Date("2026-10-28T10:55:00Z") },
  { publicacion_id: pub[1], usuario_id: u[0], fecha: new Date("2026-10-30T07:40:00Z") },
]);

// seguidores (intermedia usuarias <-> usuarias)
ng.seguidores.insertMany([
  { seguidor_id: u[0], seguido_id: u[2], fecha: new Date("2026-09-14") },
  { seguidor_id: u[1], seguido_id: u[0], fecha: new Date("2026-09-30") },
  { seguidor_id: u[2], seguido_id: u[0], fecha: new Date("2026-10-05") },
]);

// actividad (lo que alimenta el muro de cada usuaria)
ng.actividad.insertMany([
  { usuario_id: u[0], tipo: "publicacion", referencia_id: pub[0], fecha: new Date("2026-10-28T09:20:00Z") },
  { usuario_id: u[1], tipo: "me_gusta",    referencia_id: pub[0], fecha: new Date("2026-10-28T10:10:00Z") },
  { usuario_id: u[2], tipo: "comentario",  referencia_id: pub[0], fecha: new Date("2026-10-28T11:00:00Z") },
  { usuario_id: u[2], tipo: "publicacion", referencia_id: pub[1], fecha: new Date("2026-10-29T21:05:00Z") },
]);

// metodos_pago
const mp = ids(ng.metodos_pago.insertMany([
  { usuario_id: u[0], tipo: "tarjeta", marca: "Visa", ultimos_digitos: "1111", predeterminado: true },
  { usuario_id: u[1], tipo: "yape",    numero: "987654322",                    predeterminado: true },
  { usuario_id: u[2], tipo: "plin",    numero: "987654323",                    predeterminado: true },
]));

// repartidores
const r = ids(ng.repartidores.insertMany([
  { nombre: "Diego Rojas",  telefono: "911223344", vehiculo: "moto",      zona: "Lima Centro", activo: true,  entregas: 143 },
  { nombre: "Sofia Alvan",  telefono: "911223355", vehiculo: "bicicleta", zona: "Miraflores",  activo: true,  entregas: 87 },
  { nombre: "Marco Pinto",  telefono: "911223366", vehiculo: "moto",      zona: "Lima Sur",    activo: false, entregas: 210 },
]));

// pedidos (referencia usuario, pago y repartidor; items embebidos)
ng.pedidos.insertMany([
  { usuario_id: u[0], metodo_pago_id: mp[0], repartidor_id: r[0],
    items: [ { producto_id: p[0], cantidad: 2, precio_unitario: 45.90 } ],
    subtotal: 91.80, envio: 12.00, total: 103.80,
    estado: "entregado", direccion: "Av. Primavera 123, Surco",
    fecha: new Date("2026-10-30T10:00:00Z") },
  { usuario_id: u[1], metodo_pago_id: mp[1], repartidor_id: r[1],
    items: [ { producto_id: p[1], cantidad: 1, precio_unitario: 68.50 },
             { producto_id: p[2], cantidad: 1, precio_unitario: 38.00 } ],
    subtotal: 106.50, envio: 12.00, total: 118.50,
    estado: "enviado", direccion: "Jr. Las Begonias 456, San Isidro",
    fecha: new Date("2026-11-02T16:30:00Z") },
  { usuario_id: u[2], metodo_pago_id: mp[2], repartidor_id: null,
    items: [ { producto_id: p[3], cantidad: 3, precio_unitario: 28.00 } ],
    subtotal: 84.00, envio: 12.00, total: 96.00,
    estado: "pendiente", direccion: "Calle Los Olivos 789, Barranco",
    fecha: new Date("2026-11-05T09:15:00Z") },
]);

// promociones
ng.promociones.insertMany([
  { codigo: "NATURA10", descripcion: "10% de descuento en cuidado facial", descuento: 10,
    tipo: "porcentaje", categoria: "Cuidado facial",
    inicio: new Date("2026-11-01"), fin: new Date("2026-11-30"), activa: true },
  { codigo: "ENVIOGRATIS", descripcion: "Envio gratis desde S/ 150", descuento: 12,
    tipo: "envio", monto_minimo: 150,
    inicio: new Date("2026-10-15"), fin: new Date("2026-12-31"), activa: true },
  { codigo: "LAVANDA20", descripcion: "20% en aromaterapia", descuento: 20,
    tipo: "porcentaje", categoria: "Aromaterapia",
    inicio: new Date("2026-09-01"), fin: new Date("2026-09-30"), activa: false },
]);

// notificaciones
ng.notificaciones.insertMany([
  { usuario_id: u[0], tipo: "pedido",    texto: "Tu pedido fue entregado.",          leida: true,  fecha: new Date("2026-10-31T12:00:00Z") },
  { usuario_id: u[0], tipo: "social",    texto: "Camila comento tu publicacion.",    leida: false, fecha: new Date("2026-10-28T11:01:00Z") },
  { usuario_id: u[1], tipo: "promocion", texto: "NATURA10: 10% en cuidado facial.",  leida: false, fecha: new Date("2026-11-01T08:00:00Z") },
  { usuario_id: u[2], tipo: "pedido",    texto: "Tu pedido esta pendiente de pago.", leida: false, fecha: new Date("2026-11-05T09:16:00Z") },
]);

let total = 0;
ng.getCollectionNames().sort().forEach((c) => {
  const n = ng.getCollection(c).countDocuments();
  total += n;
  print(c + ": " + n);
});
print("NATURAGLOW_DB inicializada con " + total + " documentos");
