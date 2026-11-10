const env = require('../config/env');
const ApiError = require('./ApiError');
const { addDays, isValidDateStr, todayIn } = require('./date');

/**
 * "Hari ini" menurut perangkat pengguna. Aplikasi mobile mengirim header X-Client-Date
 * (YYYY-MM-DD, tanggal lokal perangkat). Tanpa header, dipakai zona waktu APP_TIMEZONE.
 * Selisih lebih dari 1 hari dari tanggal server ditolak agar tanggal tidak bisa dimanipulasi jauh.
 */
function clientToday(req) {
  const serverToday = todayIn(env.appTimezone);
  const raw = req.get('x-client-date');
  if (!raw) return serverToday;
  if (!isValidDateStr(raw)) throw new ApiError(422, 'Header X-Client-Date harus berformat YYYY-MM-DD');
  if (raw < addDays(serverToday, -1) || raw > addDays(serverToday, 1)) {
    throw new ApiError(422, 'Tanggal perangkat tidak sinkron dengan server');
  }
  return raw;
}

module.exports = { clientToday };
