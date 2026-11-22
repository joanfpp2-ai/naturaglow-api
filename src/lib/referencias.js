const mongoose = require("mongoose");
const HttpError = require("./httpError");

// MongoDB no tiene claves foraneas. Estas funciones las emulan en la capa de
// aplicacion leyendo las opciones "ref" declaradas en cada esquema.

// Devuelve [{ path, ref, arreglo }] con todos los campos que referencian a otro modelo,
// incluyendo los de subdocumentos embebidos (por ejemplo items.producto_id).
function camposReferencia(schema) {
  const campos = [];
  schema.eachPath((path, tipo) => {
    if (tipo.options && tipo.options.ref) {
      campos.push({ path, ref: tipo.options.ref, arreglo: null });
    } else if (tipo.schema) {
      // arreglo de subdocumentos
      tipo.schema.eachPath((sub, subTipo) => {
        if (subTipo.options && subTipo.options.ref) {
          campos.push({ path: sub, ref: subTipo.options.ref, arreglo: path });
        }
      });
    }
  });
  return campos;
}

// Antes de guardar: cada ObjectId referenciado debe existir (equivale a una FK).
async function validarReferencias(doc) {
  const errores = [];
  for (const campo of camposReferencia(doc.schema)) {
    const valores = campo.arreglo
      ? (doc.get(campo.arreglo) || []).map((item) => item[campo.path])
      : [doc.get(campo.path)];
    for (const valor of valores) {
      if (valor == null) continue;
      const existe = await mongoose.model(campo.ref).exists({ _id: valor });
      if (!existe) {
        errores.push({
          campo: campo.arreglo ? `${campo.arreglo}.${campo.path}` : campo.path,
          valor: String(valor),
          mensaje: `no existe en ${mongoose.model(campo.ref).collection.collectionName}`,
        });
      }
    }
  }
  if (errores.length) throw new HttpError(422, "Referencias invalidas", errores);
}

// Antes de borrar: nadie debe estar apuntando al documento (equivale a ON DELETE RESTRICT).
async function verificarSinDependientes(Model, id) {
  const dependientes = [];
  for (const nombre of mongoose.modelNames()) {
    const Otro = mongoose.model(nombre);
    for (const campo of camposReferencia(Otro.schema)) {
      if (campo.ref !== Model.modelName) continue;
      const ruta = campo.arreglo ? `${campo.arreglo}.${campo.path}` : campo.path;
      const n = await Otro.countDocuments({ [ruta]: id });
      if (n > 0) dependientes.push({ coleccion: Otro.collection.collectionName, campo: ruta, documentos: n });
    }
  }
  if (dependientes.length) {
    throw new HttpError(409, "No se puede eliminar: otros documentos lo referencian", dependientes);
  }
}

module.exports = { camposReferencia, validarReferencias, verificarSinDependientes };
