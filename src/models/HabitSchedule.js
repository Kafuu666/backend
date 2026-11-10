module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'HabitSchedule',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      habit_id: { type: DataTypes.BIGINT, allowNull: false },
      // 1 = Senin ... 7 = Minggu
      day_of_week: { type: DataTypes.TINYINT, allowNull: false },
    },
    { tableName: 'habit_schedules', timestamps: false }
  );
