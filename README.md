# NaturaGlow API — Application Tier (Backend & Containers)

**Universidad Peruana de Ciencias Aplicadas (UPC)** · 1ASI0726 Sistemas Operativos · NRC 8855 · Práctica Calificada 4

## Description

NaturaGlow is a Peruvian e-commerce platform for natural and organic cosmetics with a social component, where customers share their skincare routines, comment and react to products. This repository contains its **application tier**: a REST API built with **Node.js, Express and Mongoose** that exposes full CRUD operations over the **MongoDB** document database (`NATURAGLOW_DB`). The API and the database run in **Docker containers** orchestrated with Docker Compose on a cloud virtual machine (Ubuntu Server on Microsoft Azure).

## Team

| Student code | Full name |
|---|---|
| U202318620 | Joan Fabricio Payano Puchuri |
| U20241A827 | Miler Alexander Rodriguez Rojas |
| U202422549 | Jorge Mateo León Naupari |
| U202418250 | Poly Gabriel Alcantara Baldeon |

---

## Endpoints

Base: `http://localhost:3000` (o `http://IP_DE_LA_VM:3000`). Toda ruta `/api/...` exige la cabecera **`x-api-key`** con el valor de `API_KEY` del `.env`.

Cada colección tiene:

| Método | Ruta | Acción |
|---|---|---|
| `POST` | `/api/<coleccion>` | Crear |
| `GET` | `/api/<coleccion>` | Listar (filtro opcional: `?campo=valor`) |
| `GET` | `/api/<coleccion>/:id` | Obtener uno (`?populate=true` trae los documentos referenciados) |
| `PUT` | `/api/<coleccion>/:id` | Actualizar solo los campos enviados |
| `DELETE` | `/api/<coleccion>/:id` | Eliminar |

Colecciones: `usuarios`, `perfiles`, `productos`, `inventario`, `publicaciones`, `comentarios`, `actividad`, `pedidos`, `metodos-pago`, `repartidores`, `promociones`, `notificaciones`.

Además: `GET /api/health` (estado de la conexión a MongoDB; no pide API key).

## Body de los POST

Los campos `*_id` deben ser el `_id` de un documento que ya exista, así que crea los documentos en el orden de esta lista; si no, la API responde **422**. No envíes campos que no estén en la lista, porque responde **400**. Los campos marcados como *opcional* toman un valor por defecto.

**`/api/usuarios`**: `rol` es opcional (`cliente` o `admin`); el `email` debe ser único.
```json
{ "nombre": "Valeria Paredes", "email": "valeria@mail.com", "telefono": "987000111", "rol": "cliente" }
```

**`/api/perfiles`**: un perfil por usuario. `tipo_piel` puede ser `seca`, `grasa`, `mixta`, `normal` o `sensible`. `bio`, `foto`, `seguidores` y `siguiendo` son opcionales.
```json
{ "usuario_id": "<_id de usuarios>", "usuario": "@valeria", "bio": "Piel sensible", "tipo_piel": "sensible" }
```

**`/api/productos`**: `organico`, `imagen` e `ingredientes` son opcionales.
```json
{ "nombre": "Jabon de avena", "categoria": "Cuidado corporal", "precio": 18.9, "organico": true, "envase": "caja", "ingredientes": ["avena", "miel"] }
```

**`/api/inventario`**: un registro por producto. `ultima_reposicion` es opcional.
```json
{ "producto_id": "<_id de productos>", "stock": 50, "stock_minimo": 10, "almacen": "Lima Sur" }
```

**`/api/publicaciones`**: `imagen`, `me_gusta` y `fecha` son opcionales.
```json
{ "usuario_id": "<_id de usuarios>", "producto_id": "<_id de productos>", "texto": "Me encanto este jabon" }
```

**`/api/comentarios`**
```json
{ "publicacion_id": "<_id de publicaciones>", "usuario_id": "<_id de usuarios>", "texto": "Lo recomiendo" }
```

**`/api/actividad`**: `tipo` puede ser `publicacion`, `me_gusta` o `comentario`.
```json
{ "usuario_id": "<_id de usuarios>", "tipo": "publicacion", "referencia_id": "<_id de publicaciones>" }
```

**`/api/metodos-pago`**: con `tarjeta` se envían `marca` y `ultimos_digitos` (4 dígitos); con `yape` o `plin` se envía `numero` (9 dígitos que empiecen con 9).
```json
{ "usuario_id": "<_id de usuarios>", "tipo": "tarjeta", "marca": "Visa", "ultimos_digitos": "1111", "predeterminado": true }
```
```json
{ "usuario_id": "<_id de usuarios>", "tipo": "yape", "numero": "987654322" }
```

**`/api/repartidores`**: `vehiculo` puede ser `moto`, `bicicleta` o `auto`. `activo` y `entregas` son opcionales.
```json
{ "nombre": "Diego Rojas", "telefono": "911223344", "vehiculo": "moto", "zona": "Lima Centro" }
```

**`/api/pedidos`**: `subtotal` y `total` los calcula la API. `repartidor_id` es opcional. `estado` puede ser `pendiente` (por defecto), `pagado`, `enviado`, `entregado` o `cancelado`.
```json
{
  "usuario_id": "<_id de usuarios>",
  "metodo_pago_id": "<_id de metodos-pago>",
  "items": [ { "producto_id": "<_id de productos>", "cantidad": 2, "precio_unitario": 45.9 } ],
  "envio": 12,
  "direccion": "Av. Primavera 123, Surco"
}
```

**`/api/promociones`**: `codigo` debe ser único. Con tipo `porcentaje` se envía `categoria`; con tipo `envio`, `monto_minimo`. `fin` debe ser igual o posterior a `inicio`.
```json
{ "codigo": "NATURA15", "descripcion": "15% en cuidado facial", "descuento": 15, "tipo": "porcentaje", "categoria": "Cuidado facial", "inicio": "2026-11-01", "fin": "2026-12-31" }
```
```json
{ "codigo": "ENVIO100", "descripcion": "Envio gratis desde S/ 100", "descuento": 12, "tipo": "envio", "monto_minimo": 100, "inicio": "2026-11-01", "fin": "2026-12-31" }
```

**`/api/notificaciones`**: `tipo` puede ser `pedido`, `social` o `promocion`. `leida` es opcional.
```json
{ "usuario_id": "<_id de usuarios>", "tipo": "pedido", "texto": "Recibimos tu pedido" }
```

En Postman: **Body → raw → JSON**.
