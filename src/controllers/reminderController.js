const reminderService = require('../services/reminderService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  ok(res, await reminderService.list(req.user.id), 'Daftar pengingat');
});

exports.create = asyncHandler(async (req, res) => {
  created(res, await reminderService.create(req.user.id, req.valid.body), 'Pengingat dibuat');
});

exports.update = asyncHandler(async (req, res) => {
  ok(res, await reminderService.update(req.user.id, req.valid.params.id, req.valid.body), 'Pengingat diperbarui');
});

exports.remove = asyncHandler(async (req, res) => {
  await reminderService.remove(req.user.id, req.valid.params.id);
  ok(res, null, 'Pengingat dihapus');
});
