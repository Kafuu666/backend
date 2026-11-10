const { Habit, Reminder } = require('../models');
const ApiError = require('../utils/ApiError');
const { trimTime } = require('../utils/date');

const serialize = (r) => ({
  id: Number(r.id),
  habit_id: Number(r.habit_id),
  habit_name: r.habit?.name ?? null,
  reminder_time: trimTime(r.reminder_time),
  is_enabled: Boolean(r.is_enabled),
});

// Reminder hanya dapat diakses lewat habit milik pengguna (join dengan filter user_id)
const ownedInclude = (userId) => [
  { model: Habit, as: 'habit', attributes: ['id', 'name'], where: { user_id: userId }, required: true },
];

async function findOwned(userId, id) {
  const reminder = await Reminder.findOne({ where: { id }, include: ownedInclude(userId) });
  if (!reminder) throw new ApiError(404, 'Pengingat tidak ditemukan');
  return reminder;
}

async function list(userId) {
  const rows = await Reminder.findAll({
    include: ownedInclude(userId),
    order: [
      ['habit_id', 'ASC'],
      ['reminder_time', 'ASC'],
    ],
  });
  return rows.map(serialize);
}

async function create(userId, data) {
  const habit = await Habit.findOne({ where: { id: data.habit_id, user_id: userId }, attributes: ['id', 'name'] });
  if (!habit) throw new ApiError(404, 'Kebiasaan tidak ditemukan');
  const reminder = await Reminder.create({
    habit_id: habit.id,
    reminder_time: data.reminder_time,
    is_enabled: data.is_enabled,
  });
  reminder.habit = habit;
  return serialize(reminder);
}

async function update(userId, id, data) {
  const reminder = await findOwned(userId, id);
  await reminder.update({
    ...(data.reminder_time !== undefined ? { reminder_time: data.reminder_time } : {}),
    ...(data.is_enabled !== undefined ? { is_enabled: data.is_enabled } : {}),
  });
  return serialize(reminder);
}

async function remove(userId, id) {
  const reminder = await findOwned(userId, id);
  await reminder.destroy();
}

module.exports = { list, create, update, remove };
