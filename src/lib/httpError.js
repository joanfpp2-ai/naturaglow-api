// Error con codigo HTTP, para responder 400/404/409/422 de forma uniforme.
class HttpError extends Error {
  constructor(status, mensaje, detalle) {
    super(mensaje);
    this.status = status;
    this.detalle = detalle;
  }
}

module.exports = HttpError;
