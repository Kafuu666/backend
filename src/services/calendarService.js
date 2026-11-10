const { monthRange } = require('../utils/date');
const { getActiveHabits, getCompletedMap, buildDaily } = require('./statsCore');

function dayStatus(day, today) {
  if (day.scheduled === 0) return 'NO_SCHEDULE'; // tidak ada jadwal (bukan terlewat)
  if (day.completed === day.scheduled) return 'COMPLETED';
  if (day.date > today) return 'UPCOMING';
  if (day.completed > 0) return 'PARTIAL';
  return day.date === today ? 'PENDING' : 'MISSED';
}

async function getMonth(userId, month, today) {
  const { from, to } = monthRange(month);
  const habits = await getActiveHabits(userId);
  const completedMap = await getCompletedMap(userId, from, to);
  const { days } = buildDaily(habits, completedMap, from, to);
  return {
    month,
    days: days.map((d) => ({ ...d, status: dayStatus(d, today) })),
  };
}

module.exports = { getMonth, dayStatus };
