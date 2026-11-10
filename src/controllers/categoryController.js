const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  ok(res, await categoryService.list(req.user.id), 'Daftar kategori');
});

exports.create = asyncHandler(async (req, res) => {
  created(res, await categoryService.create(req.user.id, req.valid.body), 'Kategori dibuat');
});

exports.update = asyncHandler(async (req, res) => {
  ok(res, await categoryService.update(req.user.id, req.valid.params.id, req.valid.body), 'Kategori diperbarui');
});

exports.remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.user.id, req.valid.params.id);
  ok(res, null, 'Kategori dihapus');
});
