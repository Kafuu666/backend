const { addDays, dayOfWeek } = require('./date');

/**
 * Menghitung streak sebuah kebiasaan.
 * - Hanya hari yang dijadwalkan yang dihitung; hari tidak terjadwal tidak memutus streak.
 * - Hari ini yang belum selesai belum memutus streak (pengguna masih punya waktu).
 *
 * @param {Object} p
 * @param {Set<number>} p.scheduledDays  hari aktif (1 = Senin ... 7 = Minggu)
 * @param {Set<string>} p.completedDates tanggal selesai "YYYY-MM-DD"
 * @param {string} p.startDate           tanggal mulai kebiasaan
 * @param {string} p.today               tanggal lokal pengguna
 * @returns {{current: number, best: number}}
 */
function computeStreak({ scheduledDays, completedDates, startDate, today }) {
  let run = 0;
  let best = 0;
  if (startDate > today) return { current: 0, best: 0 };

  for (let d = startDate; d <= today; d = addDays(d, 1)) {
    if (!scheduledDays.has(dayOfWeek(d))) continue;
    if (completedDates.has(d)) {
      run += 1;
      if (run > best) best = run;
    } else if (d !== today) {
      run = 0;
    }
  }
  return { current: run, best };
}

module.exports = { computeStreak };
