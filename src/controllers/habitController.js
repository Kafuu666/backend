const habitService = require('../services/habitService');
const logService = require('../services/logService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { clientToday } = require('../utils/clientDate');
const { ok, created } = require('../utils/response');

// ----- CRUD habit -----
exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await habitService.list(req.user.id, req.valid.query);
  ok(res, items, 'Daftar kebiasaan', 200, meta);
});

exports.get = asyncHandler(async (req, res) => {
  ok(res, await habitService.get(req.user.id, req.valid.params.id), 'Detail kebiasaan');
});

exports.create = asyncHandler(async (req, res) => {
  created(res, await habitService.create(req.user.id, req.valid.body), 'Habit created successfully');
});

exports.update = asyncHandler(async (req, res) => {
  ok(res, await habitService.update(req.user.id, req.valid.params.id, req.valid.body), 'Kebiasaan diperbarui');
});

exports.remove = asyncHandler(async (req, res) => {
  await habitService.remove(req.user.id, req.valid.params.id);
  ok(res, null, 'Kebiasaan dihapus');
});

// ----- Habit log -----
exports.today = asyncHandler(async (req, res) => {
  ok(res, await logService.getDayDetail(req.user.id, clientToday(req)), 'Aktivitas hari ini');
});

exports.history = asyncHandler(async (req, res) => {
  const { items, meta } = await logService.history(req.user.id, req.valid.query, clientToday(req));
  ok(res, items, 'Riwayat aktivitas', 200, meta);
});

exports.complete = asyncHandler(async (req, res) => {
  const today = clientToday(req);
  const date = req.valid.body.date || today;
  if (date > today) throw new ApiError(422, 'Tidak dapat mencatat aktivitas untuk tanggal di masa depan');
  ok(res, await logService.complete(req.user.id, req.valid.params.id, date), 'Kebiasaan ditandai selesai');
});

exports.uncomplete = asyncHandler(async (req, res) => {
  const date = req.valid.query.date || clientToday(req);
  ok(res, await logService.uncomplete(req.user.id, req.valid.params.id, date), 'Status selesai dibatalkan');
});
