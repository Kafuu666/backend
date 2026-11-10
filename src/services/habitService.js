const { Op } = require('sequelize');
const { sequelize, Habit, HabitSchedule, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { trimTime } = require('../utils/date');

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];

const include = [
  { model: HabitSchedule, as: 'schedules', attributes: ['id', 'day_of_week'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'color'] },
];

function serialize(h) {
  return {
    id: Number(h.id),
    name: h.name,
    description: h.description,
    icon: h.icon,
    frequency: h.frequency,
    target_count: h.target_count,
    reminder_time: trimTime(h.reminder_time),
    is_active: Boolean(h.is_active),
    category_id: h.category_id == null ? null : Number(h.category_id),
    category: h.category
      ? { id: Number(h.category.id), name: h.category.name, color: h.category.color }
      : null,
    schedule_days: (h.schedules || []).map((s) => Number(s.day_of_week)).sort((a, b) => a - b),
    created_at: h.created_at,
    updated_at: h.updated_at,
  };
}

// Kategori boleh dipakai bila bawaan sistem (user_id NULL) atau milik pengguna sendiri
async function assertCategoryUsable(userId, categoryId) {
  if (categoryId == null) return;
  const category = await Category.findOne({
    where: { id: categoryId, [Op.or]: [{ user_id: null }, { user_id: userId }] },
  });
  if (!category) throw new ApiError(422, 'Kategori tidak ditemukan');
}

async function findOwned(userId, id) {
  const habit = await Habit.findOne({ where: { id, user_id: userId }, include });
  if (!habit) throw new ApiError(404, 'Kebiasaan tidak ditemukan');
  return habit;
}

async function list(userId, { is_active, category_id, page, limit }) {
  const where = { user_id: userId };
  if (is_active !== undefined) where.is_active = is_active;
  if (category_id) where.category_id = category_id;

  const { rows, count } = await Habit.findAndCountAll({
    where,
    include,
    distinct: true,
    order: [
      ['created_at', 'DESC'],
      ['id', 'DESC'],
    ],
    limit,
    offset: (page - 1) * limit,
  });
  return { items: rows.map(serialize), meta: { page, limit, total: count } };
}

async function get(userId, id) {
  return serialize(await findOwned(userId, id));
}

async function create(userId, data) {
  await assertCategoryUsable(userId, data.category_id);
  const days = data.frequency === 'WEEKLY' ? [...new Set(data.days_of_week)].sort() : ALL_DAYS;

  const habit = await sequelize.transaction(async (transaction) => {
    const created = await Habit.create(
      {
        user_id: userId, // dari JWT
        category_id: data.category_id ?? null,
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
        frequency: data.frequency,
        target_count: data.target_count,
        reminder_time: data.reminder_time ?? null,
        is_active: data.is_active,
      },
      { transaction }
    );
    await HabitSchedule.bulkCreate(
      days.map((d) => ({ habit_id: created.id, day_of_week: d })),
      { transaction }
    );
    return created;
  });

  return serialize(await findOwned(userId, habit.id));
}

async function update(userId, id, data) {
  const habit = await findOwned(userId, id);
  if (data.category_id !== undefined) await assertCategoryUsable(userId, data.category_id);

  // Hitung ulang jadwal hanya bila frekuensi atau hari berubah
  let days = null;
  if (data.frequency !== undefined || data.days_of_week !== undefined) {
    const frequency = data.frequency ?? habit.frequency;
    if (frequency === 'DAILY') {
      days = ALL_DAYS;
    } else {
      const source =
        data.days_of_week ??
        (habit.frequency === 'WEEKLY' ? habit.schedules.map((s) => Number(s.day_of_week)) : []);
      if (source.length === 0) {
        throw new ApiError(422, 'Kebiasaan mingguan membutuhkan minimal satu hari aktif', [
          { field: 'days_of_week', message: 'days_of_week wajib diisi untuk frekuensi WEEKLY' },
        ]);
      }
      days = [...new Set(source)].sort();
    }
  }

  const fields = {};
  for (const key of ['name', 'description', 'category_id', 'icon', 'frequency', 'target_count', 'reminder_time', 'is_active']) {
    if (data[key] !== undefined) fields[key] = data[key] === '' ? null : data[key];
  }

  await sequelize.transaction(async (transaction) => {
    await habit.update(fields, { transaction });
    if (days) {
      await HabitSchedule.destroy({ where: { habit_id: habit.id }, transaction });
      await HabitSchedule.bulkCreate(
        days.map((d) => ({ habit_id: habit.id, day_of_week: d })),
        { transaction }
      );
    }
  });

  return serialize(await findOwned(userId, id));
}

async function remove(userId, id) {
  // Jadwal, log, dan reminder ikut terhapus melalui foreign key ON DELETE CASCADE
  const deleted = await Habit.destroy({ where: { id, user_id: userId } });
  if (!deleted) throw new ApiError(404, 'Kebiasaan tidak ditemukan');
}

module.exports = { list, get, create, update, remove };
