const { Router } = require("express");
const mongoose = require("mongoose");
const HttpError = require("./httpError");
const { camposReferencia, validarReferencias, verificarSinDependientes } = require("./referencias");

const PARAMS_RESERVADOS = new Set(["limit", "skip", "sort", "populate"]);

function validarId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `"${id}" no es un ObjectId valido`);
}

// Construye el filtro de busqueda a partir del query string, aceptando solo
// campos que existen en el esquema (evita inyeccion de operadores como $where).
function filtroDesdeQuery(Model, query) {
  const filtro = {};
  for (const [clave, valor] of Object.entries(query)) {
    if (PARAMS_RESERVADOS.has(clave)) continue;
    if (!Model.schema.path(clave)) throw new HttpError(400, `"${clave}" no es un campo de ${Model.collection.collectionName}`);
    if (typeof valor !== "string") throw new HttpError(400, `filtro "${clave}" invalido`);
    filtro[clave] = valor;
  }
  return filtro;
}

function rutasPopulate(Model) {
  return camposReferencia(Model.schema).map((c) => (c.arreglo ? `${c.arreglo}.${c.path}` : c.path));
}

// Genera las 5 rutas CRUD de una coleccion:
//   POST   /      -> Insert   (crear)
//   GET    /      -> Select   (listar, con filtros ?campo=valor&limit=&skip=&sort=)
//   GET    /:id   -> Select   (uno; ?populate=true trae los documentos referenciados)
//   PUT    /:id   -> Update   (actualiza solo los campos enviados, con validacion)
//   DELETE /:id   -> Delete   (rechaza con 409 si otros documentos lo referencian)
function crudRouter(Model) {
  const router = Router();

  // INSERT
  router.post("/", async (req, res) => {
    const doc = new Model(req.body);
    await doc.validate();
    await validarReferencias(doc);
    await doc.save();
    res.status(201).json(doc);
  });

  // SELECT (todos)
  router.get("/", async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const sort = typeof req.query.sort === "string" ? req.query.sort : "_id";
    const filtro = filtroDesdeQuery(Model, req.query);

    let consulta = Model.find(filtro).sort(sort).skip(skip).limit(limit);
    if (req.query.populate === "true") consulta = consulta.populate(rutasPopulate(Model));

    const [datos, total] = await Promise.all([consulta, Model.countDocuments(filtro)]);
    res.json({ coleccion: Model.collection.collectionName, total, limit, skip, datos });
  });

  // SELECT (uno)
  router.get("/:id", async (req, res) => {
    validarId(req.params.id);
    let consulta = Model.findById(req.params.id);
    if (req.query.populate === "true") consulta = consulta.populate(rutasPopulate(Model));
    const doc = await consulta;
    if (!doc) throw new HttpError(404, "Documento no encontrado");
    res.json(doc);
  });

  // UPDATE
  router.put("/:id", async (req, res) => {
    validarId(req.params.id);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new HttpError(404, "Documento no encontrado");
    const { _id, ...cambios } = req.body || {};
    doc.set(cambios);
    await doc.validate();
    await validarReferencias(doc);
    await doc.save();
    res.json(doc);
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    validarId(req.params.id);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new HttpError(404, "Documento no encontrado");
    await verificarSinDependientes(Model, doc._id);
    await doc.deleteOne();
    res.json({ mensaje: "Documento eliminado", eliminado: doc });
  });

  return router;
}

module.exports = crudRouter;
