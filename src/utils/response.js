const ok = (res, data = null, message = 'Berhasil', status = 200, meta) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

const created = (res, data, message = 'Data berhasil dibuat') => ok(res, data, message, 201);

module.exports = { ok, created };
