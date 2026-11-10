const { Op } = require('sequelize');
const env = require('../config/env');
const { sequelize, Habit, HabitSchedule, HabitLog } = require('../models');
const ApiError = require('../utils/ApiError');
const { addDays, dayOfWeek, normalizeDate } = require('../utils/date');
const { toHabitView } = require('./habitView');
const { percent, getActiveHabits } = require('./statsCore');

// Daftar kebiasaan terjadwal pada satu tanggal beserta status selesainya
async function getDayDetail(userId, date) {
  const habits = await getActiveHabits(userId);
  const logs = await HabitLog.findAll({
    where: { user_id: userId, log_date: date, completed: true },
    raw: true,
  });
  const logByHabit = new Map(logs.map((l) => [Number(l.habit_id), l]));
  const dow = dayOfWeek(date);

  const items = habits
    .filter((h) => date >= h.start && h.days.has(dow))
    .map((h) => ({
      habit_id: h.id,
      name: h.name,
      icon: h.icon,
      category: h.category,
      target_count: h.target_count,
      reminder_time: h.reminder_time,
      completed: logByHabit.has(h.id),
      completed_at: logByHabit.get(h.id)?.completed_at ?? null,
    }));

  const completed = items.filter((i) => i.completed).length;
  return {
    date,
    summary: { scheduled: items.length, completed, progress: percent(completed, items.length) },
    habits: items,
  };
}

async function complete(userId, habitId, date) {
  const habit = await Habit.findOne({
    where: { id: habitId, user_id: userId },
    include: [{ model: HabitSchedule, as: 'schedules', attributes: ['day_of_week'] }],
  });
  if (!habit) throw new ApiError(404, 'Kebiasaan tidak ditemukan');
  if (!habit.is_active) throw new ApiError(422, 'Kebiasaan sedang tidak aktif');

  const view = toHabitView(habit);
  if (date < view.start) throw new ApiError(422, 'Tidak dapat mencatat sebelum kebiasaan dibuat');
  if (!view.days.has(dayOfWeek(date))) {
    throw new ApiError(422, 'Kebiasaan tidak dijadwalkan pada tanggal ini');
  }

  // findOrCreate di dalam transaksi + unique constraint (habit_id, log_date) => tidak ada log ganda
  const log = await sequelize.transaction(async (transaction) => {
    const [row, created] = await HabitLog.findOrCreate({
      where: { habit_id: habit.id, log_date: date },
      defaults: { user_id: userId, completed: true, completed_at: new Date() },
      transaction,
    });
    if (!created && !row.completed) {
      await row.update({ completed: true, completed_at: new Date() }, { transaction });
    }
    return row;
  });

  return { habit_id: Number(habit.id), log_date: date, completed: true, completed_at: log.completed_at };
}

async function uncomplete(userId, habitId, date) {
  const habit = await Habit.findOne({ where: { id: habitId, user_id: userId }, attributes: ['id'] });
  if (!habit) throw new ApiError(404, 'Kebiasaan tidak ditemukan');

  // Idempotent: membatalkan log yang belum ada tetap dianggap berhasil
  await HabitLog.destroy({ where: { habit_id: habit.id, user_id: userId, log_date: date } });
  return { habit_id: Number(habit.id), log_date: date, completed: false, completed_at: null };
}

async function history(userId, { from, to, habit_id, page, limit }, today) {
  const end = to || today;
  const start = from || addDays(end, -29);
  if (start > end) throw new ApiError(422, 'Parameter from tidak boleh setelah to');

  const where = { user_id: userId, log_date: { [Op.between]: [start, end] } };
  if (habit_id) where.habit_id = habit_id;

  const { rows, count } = await HabitLog.findAndCountAll({
    where,
    include: [{ model: Habit, as: 'habit', attributes: ['id', 'name', 'icon'] }],
    order: [
      ['log_date', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset: (page - 1) * limit,
  });

  return {
    items: rows.map((l) => ({
      id: Number(l.id),
      habit_id: Number(l.habit_id),
      habit_name: l.habit?.name ?? null,
      icon: l.habit?.icon ?? null,
      log_date: normalizeDate(l.log_date, env.appTimezone),
      completed: Boolean(l.completed),
      completed_at: l.completed_at,
    })),
    meta: { page, limit, total: count, from: start, to: end },
  };
}

module.exports = { getDayDetail, complete, uncomplete, history };
