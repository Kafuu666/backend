const { HabitLog } = require('../models');
const { addDays, monthRange } = require('../utils/date');
const { getActiveHabits, getCompletedMap, buildDaily, sumDays, getStreaks, percent } = require('./statsCore');

async function overview(userId, today) {
  const habits = await getActiveHabits(userId);
  const from = addDays(today, -29);
  const completedMap = await getCompletedMap(userId, from, today);
  const { days, perHabit } = buildDaily(habits, completedMap, from, today);
  const totals = sumDays(days);
  const streaks = await getStreaks(userId, habits, today);
  const totalCompleted = await HabitLog.count({ where: { user_id: userId, completed: true } });

  const topHabits = habits
    .map((h) => {
      const s = perHabit.get(h.id);
      return { habit_id: h.id, name: h.name, icon: h.icon, scheduled: s.scheduled, completed: s.completed, rate: percent(s.completed, s.scheduled) };
    })
    .filter((h) => h.scheduled > 0)
    .sort((a, b) => b.rate - a.rate || b.completed - a.completed)
    .slice(0, 3);

  const todayRow = days[days.length - 1];
  return {
    today: { scheduled: todayRow.scheduled, completed: todayRow.completed, progress: todayRow.progress },
    active_habits: habits.length,
    total_completed: totalCompleted,
    completion_rate_30d: totals.rate,
    best_current_streak: streaks.reduce((m, s) => Math.max(m, s.current), 0),
    best_streak: streaks.reduce((m, s) => Math.max(m, s.best), 0),
    top_habits: topHabits,
  };
}

// 7 hari terakhir termasuk hari ini
async function weekly(userId, today) {
  const from = addDays(today, -6);
  const habits = await getActiveHabits(userId);
  const completedMap = await getCompletedMap(userId, from, today);
  const { days } = buildDaily(habits, completedMap, from, today);
  return { from, to: today, days, totals: sumDays(days) };
}

// Satu bulan kalender (default bulan berjalan), dihitung sampai hari ini saja
async function monthly(userId, month, today) {
  const { from, to: monthEnd } = monthRange(month);
  const to = monthEnd > today ? today : monthEnd;
  const habits = await getActiveHabits(userId);
  const completedMap = await getCompletedMap(userId, from, to);
  const { days } = buildDaily(habits, completedMap, from, to);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const sum = sumDays(chunk);
    const startDay = i + 1;
    weeks.push({ label: `${startDay}-${i + chunk.length}`, ...sum });
  }
  return { month, from, to, days, weeks, totals: sumDays(days) };
}

async function streaks(userId, today) {
  const habits = await getActiveHabits(userId);
  const list = await getStreaks(userId, habits, today);
  return {
    best_current: list.reduce((m, s) => Math.max(m, s.current), 0),
    best_ever: list.reduce((m, s) => Math.max(m, s.best), 0),
    habits: list.sort((a, b) => b.current - a.current || b.best - a.best),
  };
}

module.exports = { overview, weekly, monthly, streaks };
