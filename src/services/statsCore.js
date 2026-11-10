const { Op } = require('sequelize');
const env = require('../config/env');
const { Habit, HabitSchedule, HabitLog, Category } = require('../models');
const { dayOfWeek, eachDay, normalizeDate } = require('../utils/date');
const { computeStreak } = require('../utils/streak');
const { toHabitView } = require('./habitView');

const percent = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

// Kebiasaan aktif milik pengguna beserta jadwalnya
async function getActiveHabits(userId) {
  const habits = await Habit.findAll({
    where: { user_id: userId, is_active: true },
    include: [
      { model: HabitSchedule, as: 'schedules', attributes: ['day_of_week'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'color'] },
    ],
    order: [
      ['created_at', 'ASC'],
      ['id', 'ASC'],
    ],
  });
  return habits.map(toHabitView);
}

// Map<habitId, Set<tanggal>> untuk log selesai dalam rentang tanggal
async function getCompletedMap(userId, from, to) {
  const logs = await HabitLog.findAll({
    where: { user_id: userId, completed: true, log_date: { [Op.between]: [from, to] } },
    attributes: ['habit_id', 'log_date'],
    raw: true,
  });
  const map = new Map();
  for (const log of logs) {
    const id = Number(log.habit_id);
    if (!map.has(id)) map.set(id, new Set());
    map.get(id).add(normalizeDate(log.log_date, env.appTimezone));
  }
  return map;
}

/**
 * Ringkasan per hari: jumlah kebiasaan terjadwal, selesai, dan persentase progres.
 * Juga mengembalikan hitungan per kebiasaan untuk rentang yang sama.
 */
function buildDaily(habits, completedMap, from, to) {
  const perHabit = new Map(habits.map((h) => [h.id, { scheduled: 0, completed: 0 }]));
  const days = eachDay(from, to).map((date) => {
    const dow = dayOfWeek(date);
    let scheduled = 0;
    let completed = 0;
    for (const h of habits) {
      if (date < h.start || !h.days.has(dow)) continue;
      scheduled += 1;
      const stat = perHabit.get(h.id);
      stat.scheduled += 1;
      if (completedMap.get(h.id)?.has(date)) {
        completed += 1;
        stat.completed += 1;
      }
    }
    return { date, scheduled, completed, progress: percent(completed, scheduled) };
  });
  return { days, perHabit };
}

function sumDays(days) {
  const scheduled = days.reduce((a, d) => a + d.scheduled, 0);
  const completed = days.reduce((a, d) => a + d.completed, 0);
  return { scheduled, completed, rate: percent(completed, scheduled) };
}

// Streak saat ini dan terbaik untuk setiap kebiasaan aktif
async function getStreaks(userId, habits, today) {
  if (habits.length === 0) return [];
  const earliest = habits.reduce((min, h) => (h.start < min ? h.start : min), today);
  const completedMap = await getCompletedMap(userId, earliest, today);
  return habits.map((h) => {
    const { current, best } = computeStreak({
      scheduledDays: h.days,
      completedDates: completedMap.get(h.id) || new Set(),
      startDate: h.start,
      today,
    });
    return { habit_id: h.id, name: h.name, icon: h.icon, current, best };
  });
}

module.exports = { percent, getActiveHabits, getCompletedMap, buildDaily, sumDays, getStreaks };
