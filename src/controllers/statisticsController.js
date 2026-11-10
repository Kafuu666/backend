const statisticsService = require('../services/statisticsService');
const asyncHandler = require('../utils/asyncHandler');
const { clientToday } = require('../utils/clientDate');
const { ok } = require('../utils/response');

exports.overview = asyncHandler(async (req, res) => {
  ok(res, await statisticsService.overview(req.user.id, clientToday(req)), 'Ringkasan statistik');
});

exports.weekly = asyncHandler(async (req, res) => {
  ok(res, await statisticsService.weekly(req.user.id, clientToday(req)), 'Statistik mingguan');
});

exports.monthly = asyncHandler(async (req, res) => {
  const today = clientToday(req);
  const month = req.valid.query.month || today.slice(0, 7);
  ok(res, await statisticsService.monthly(req.user.id, month, today), 'Statistik bulanan');
});

exports.streaks = asyncHandler(async (req, res) => {
  ok(res, await statisticsService.streaks(req.user.id, clientToday(req)), 'Informasi streak');
});
