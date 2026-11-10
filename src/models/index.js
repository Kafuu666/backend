const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Habit = require('./Habit')(sequelize, DataTypes);
const HabitSchedule = require('./HabitSchedule')(sequelize, DataTypes);
const HabitLog = require('./HabitLog')(sequelize, DataTypes);
const Reminder = require('./Reminder')(sequelize, DataTypes);

// users 1..n habits
User.hasMany(Habit, { foreignKey: 'user_id', as: 'habits', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// users 1..n categories (kategori pribadi)
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// categories 1..n habits
Category.hasMany(Habit, { foreignKey: 'category_id', as: 'habits', onDelete: 'SET NULL' });
Habit.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// habits 1..n habit_schedules
Habit.hasMany(HabitSchedule, { foreignKey: 'habit_id', as: 'schedules', onDelete: 'CASCADE' });
HabitSchedule.belongsTo(Habit, { foreignKey: 'habit_id', as: 'habit' });

// habits 1..n habit_logs, users 1..n habit_logs
Habit.hasMany(HabitLog, { foreignKey: 'habit_id', as: 'logs', onDelete: 'CASCADE' });
HabitLog.belongsTo(Habit, { foreignKey: 'habit_id', as: 'habit' });
User.hasMany(HabitLog, { foreignKey: 'user_id', as: 'logs', onDelete: 'CASCADE' });
HabitLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// habits 1..n reminders
Habit.hasMany(Reminder, { foreignKey: 'habit_id', as: 'reminders', onDelete: 'CASCADE' });
Reminder.belongsTo(Habit, { foreignKey: 'habit_id', as: 'habit' });

module.exports = { sequelize, User, Category, Habit, HabitSchedule, HabitLog, Reminder };
