const env = require('../config/env');
const { toDateString, trimTime } = require('../utils/date');

/**
 * Representasi ringan sebuah habit untuk perhitungan progres/streak.
 * Model harus di-include dengan `schedules` dan (opsional) `category`.
 */
function toHabitView(h) {
  return {
    id: Number(h.id),
    name: h.name,
    icon: h.icon,
    target_count: h.target_count,
    reminder_time: trimTime(h.reminder_time),
    category: h.category
      ? { id: Number(h.category.id), name: h.category.name, color: h.category.color }
      : null,
    days: new Set((h.schedules || []).map((s) => Number(s.day_of_week))),
    // Hari pertama kebiasaan ini dihitung (tanggal pembuatan pada zona waktu aplikasi)
    start: toDateString(h.created_at, env.appTimezone),
  };
}

module.exports = { toHabitView };
