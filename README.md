# NaturaGlow API — Application Tier (Backend & Containers)

**Universidad Peruana de Ciencias Aplicadas (UPC)** · 1ASI0726 Sistemas Operativos · NRC 8855 · Práctica Calificada 4

## Description

NaturaGlow is a Peruvian e-commerce platform for natural and organic cosmetics with a social component, where customers share their skincare routines, comment and react to products. This repository contains its **application tier**: a REST API built with **Node.js, Express and Mongoose** that exposes full CRUD operations over the **MongoDB** document database (`NATURAGLOW_DB`). The API and the database run in **Docker containers** orchestrated with Docker Compose on a cloud virtual machine (Ubuntu Server on Microsoft Azure). The deployment includes API key authentication, input validation, referential integrity checks, MongoDB access control and persistent storage.

## Team

| Student code | Full name |
|---|---|
| U202318620 | Joan Fabricio Payano Puchuri |
| U20241A827 | Miler Alexander Rodriguez Rojas |
| U202422549 | Jorge Mateo León Naupari |
| U202418250 | Poly Gabriel Alcantara Baldeon |

---

Capa de aplicación (*Application Tier*) de NaturaGlow: **API REST CRUD** en **Node.js + Express + Mongoose**, ejecutándose en **contenedores Docker** sobre una VM en la nube, conectada a **MongoDB** (`NATURAGLOW_DB`, mismo modelo de 14 colecciones de la PC3).

```
 Postman / Frontend  ──HTTP :3000──►  contenedor_api (Node 24 + Express)  ──red interna──►  contenedor_db (MongoDB 9.0)
   (Presentation)                         (Application Tier)                                   (Data Tier, volumen persistente)
```

## Colecciones expuestas (12 de 14)

| Recurso | Colección | Recurso | Colección |
|---|---|---|---|
| `/api/usuarios` | usuarios | `/api/actividad` | actividad |
| `/api/perfiles` | perfiles | `/api/pedidos` | pedidos (items embebidos) |
| `/api/productos` | productos | `/api/metodos-pago` | metodos_pago |
| `/api/inventario` | inventario | `/api/repartidores` | repartidores |
| `/api/publicaciones` | publicaciones | `/api/promociones` | promociones |
| `/api/comentarios` | comentarios | `/api/notificaciones` | notificaciones |

`me_gusta` y `seguidores` son **colecciones intermedias** (relaciones muchos a muchos sin datos propios), por eso **no** se exponen como recurso. Sí se usan para validar la integridad al borrar. `items` no es una colección: va embebido dentro de `pedidos`.

Cada recurso tiene:

| Operación | Método y ruta | Notas |
|---|---|---|
| Insert | `POST /api/<recurso>` | Valida tipos, enums y que los `*_id` referenciados existan (422 si no) |
| Select | `GET /api/<recurso>` | Filtros `?campo=valor`, `limit`, `skip`, `sort`, `populate=true` |
| Select uno | `GET /api/<recurso>/:id` | `?populate=true` une las colecciones referenciadas |
| Update | `PUT /api/<recurso>/:id` | Actualiza solo los campos enviados, con validación |
| Delete | `DELETE /api/<recurso>/:id` | 409 si otro documento lo referencia (como `ON DELETE RESTRICT`) |

Rutas públicas: `GET /` (información) y `GET /api/health` (estado de la conexión a la BD y el id del contenedor).

## Seguridad e integración

- **API key** en la cabecera `x-api-key`, obligatoria para todo `/api/*`.
- **helmet** (cabeceras HTTP seguras), **CORS**, **rate limit** (300 peticiones cada 15 min), body JSON de máximo 100 KB.
- **strict mode**: un campo que no existe en el esquema se rechaza con 400 (evita la asignación masiva de campos).
- MongoDB **con autenticación**. La API usa el usuario `ng_api`, que solo tiene `readWrite` sobre `NATURAGLOW_DB` (mínimo privilegio). Esto corrige el riesgo 1 de la PC3.
- **Volumen persistente** `mongo_data`: los datos sobreviven a `docker compose down`. Esto corrige el riesgo 2 de la PC3.
- El puerto de MongoDB **no** se expone a Internet: solo en `127.0.0.1` de la VM, y se accede con un túnel SSH.
- El contenedor de la API corre como usuario `node` (no root) y tiene `HEALTHCHECK`.

---

## Despliegue en la VM (Azure)

### 1. Crear la VM
- Imagen: **Ubuntu Server 24.04 LTS**. Tamaño sugerido: **Standard B2s** (2 vCPU, 4 GB RAM), disco de 30 GB.
- Autenticación con **clave SSH**; usuario `azureuser`.
- Puertos de entrada (NSG): **22 (SSH)** y **3000 (API)**. Si el asistente solo permite 22, agrega después en *Redes → Agregar regla de puerto de entrada*: TCP 3000, origen *Any*.

### 2. Conectarse e instalar
```bash
ssh -i ruta/a/tu-clave.pem azureuser@IP_PUBLICA_VM
git clone https://github.com/joanfpp2-ai/naturaglow-api.git
cd naturaglow-api
bash scripts/setup-vm.sh
```
El script instala Docker Engine y Compose, genera `.env` con claves aleatorias, construye la imagen y levanta los dos contenedores. Al final muestra la **URL** y la **API key** para Postman.

### 3. Probar con Postman
1. *Import* → `postman/NaturaGlow_PC4.postman_collection.json`.
2. En la colección → *Variables*: `baseUrl = http://IP_PUBLICA_VM:3000` y `apiKey = <API_KEY del .env>`.
3. Ejecuta las carpetas en orden: **0. Salud → 1. INSERT → 2. SELECT → 3. UPDATE → 4. Validaciones → 5. DELETE → 6. Verificar borrado**. También puedes usar *Run collection* para correrlas todas: son 82 peticiones y 152 pruebas.

### 4. Ver los datos en MongoDB Compass (túnel SSH)
```bash
# En tu PC (deja esta terminal abierta)
ssh -i ruta/a/tu-clave.pem -L 27018:127.0.0.1:27017 azureuser@IP_PUBLICA_VM
```
En Compass: `mongodb://ng_root:<MONGO_ROOT_PASSWORD>@localhost:27018/?authSource=admin`

---

## Comandos útiles para las evidencias (en la VM)

```bash
sudo docker compose ps                         # los 2 contenedores Up (healthy)
sudo docker ps                                 # puertos publicados
sudo docker images                             # imagen naturaglow-api:1.0 y mongo:9.0
sudo docker compose logs -f api                # log de cada peticion HTTP
sudo docker network inspect naturaglow-api_naturaglow_net
sudo docker volume ls                          # volumen persistente
sudo docker exec contenedor_api cat /etc/os-release   # SO del contenedor (Alpine)
curl -s localhost:3000/api/health

# Consola de MongoDB para comprobar que los datos cambian de verdad
sudo docker exec -it contenedor_db mongosh -u ng_root -p "$(grep MONGO_ROOT_PASSWORD .env | cut -d= -f2)" --authenticationDatabase admin NATURAGLOW_DB
#   > db.usuarios.find()            (antes y despues de cada POST/PUT/DELETE)
#   > db.getUsers()                 (usuario ng_api con rol readWrite)

# Ciclo de vida
sudo docker compose stop     # detener
sudo docker compose start    # reanudar (los datos se conservan)
sudo docker compose down     # eliminar contenedores (el volumen se conserva)
```

## Estructura

```
src/
  server.js              arranque, conexión a MongoDB con reintentos, apagado ordenado
  app.js                 middleware (helmet, cors, morgan, rate limit, api key) y rutas
  lib/crudRouter.js      genera las 5 rutas CRUD de cada colección
  lib/referencias.js     integridad referencial (FK emuladas) en la capa de aplicación
  models/*.model.js      esquemas Mongoose de las 14 colecciones
mongo-init/              crea el usuario ng_api, los índices únicos y los 47 documentos iniciales
postman/                 colección de Postman con el ciclo CRUD completo
scripts/setup-vm.sh      instalación de Docker y despliegue en Ubuntu
```
