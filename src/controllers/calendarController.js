const calendarService = require('../services/calendarService');
const logService = require('../services/logService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { clientToday } = require('../utils/clientDate');
const { isValidDateStr } = require('../utils/date');
const { ok } = require('../utils/response');

exports.month = asyncHandler(async (req, res) => {
  const today = clientToday(req);
  const month = req.valid.query.month || today.slice(0, 7);
  ok(res, await calendarService.getMonth(req.user.id, month, today), 'Kalender bulanan');
});

exports.day = asyncHandler(async (req, res) => {
  const { date } = req.valid.params;
  if (!isValidDateStr(date)) throw new ApiError(422, 'Tanggal tidak valid');
  ok(res, await logService.getDayDetail(req.user.id, date), 'Aktivitas pada tanggal terpilih');
});
