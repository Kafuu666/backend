const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Terjadi kesalahan pada server';
  let details;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Body request bukan JSON yang valid';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Data sudah ada';
  } else if (err.name === 'SequelizeValidationError') {
    status = 422;
    message = 'Validasi gagal';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (env.nodeEnv === 'production') message = 'Terjadi kesalahan pada server';
    else message = err.message || message;
  }

  const body = { success: false, message };
  if (details) body.details = details;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
