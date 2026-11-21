// Express 4 no propaga errores de funciones asíncronas; este envoltorio sí.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
