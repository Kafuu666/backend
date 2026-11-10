const Joi = require('joi');

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const dateStr = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/);
const monthStr = Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/);
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/);

// ---------- Auth ----------
const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().max(150).required(),
  password: Joi.string().min(6).max(72).required(),
});

const login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

// ---------- Habit ----------
const days = Joi.array().items(Joi.number().integer().min(1).max(7)).unique();

const habitFields = {
  name: Joi.string().trim().min(1).max(150),
  description: Joi.string().trim().max(2000).allow('', null),
  category_id: Joi.number().integer().positive().allow(null),
  icon: Joi.string().trim().max(50).allow('', null),
  frequency: Joi.string().valid('DAILY', 'WEEKLY'),
  days_of_week: days,
  target_count: Joi.number().integer().min(1).max(1000),
  reminder_time: time.allow(null),
  is_active: Joi.boolean(),
};

const createHabit = Joi.object({
  ...habitFields,
  name: habitFields.name.required(),
  frequency: habitFields.frequency.default('DAILY'),
  // Kebiasaan mingguan wajib punya hari aktif
  days_of_week: days.when('frequency', { is: 'WEEKLY', then: Joi.array().min(1).required() }),
  target_count: habitFields.target_count.default(1),
  is_active: habitFields.is_active.default(true),
});

const updateHabit = Joi.object(habitFields).min(1);

const listHabits = Joi.object({
  is_active: Joi.boolean(),
  category_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

// ---------- Habit log ----------
const completeBody = Joi.object({ date: dateStr });
const uncompleteQuery = Joi.object({ date: dateStr });

const historyQuery = Joi.object({
  from: dateStr,
  to: dateStr,
  habit_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

// ---------- Calendar & statistics ----------
const calendarQuery = Joi.object({ month: monthStr });
const dateParam = Joi.object({ date: dateStr.required() });
const monthlyQuery = Joi.object({ month: monthStr });

// ---------- Category ----------
const createCategory = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
});
const updateCategory = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  color: Joi.string().trim().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
}).min(1);

// ---------- Reminder ----------
const createReminder = Joi.object({
  habit_id: Joi.number().integer().positive().required(),
  reminder_time: time.required(),
  is_enabled: Joi.boolean().default(true),
});
const updateReminder = Joi.object({
  reminder_time: time,
  is_enabled: Joi.boolean(),
}).min(1);

module.exports = {
  idParam,
  register,
  login,
  createHabit,
  updateHabit,
  listHabits,
  completeBody,
  uncompleteQuery,
  historyQuery,
  calendarQuery,
  dateParam,
  monthlyQuery,
  createCategory,
  updateCategory,
  createReminder,
  updateReminder,
};
