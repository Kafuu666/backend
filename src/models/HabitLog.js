module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'HabitLog',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      habit_id: { type: DataTypes.BIGINT, allowNull: false },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      log_date: { type: DataTypes.DATEONLY, allowNull: false },
      completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'habit_logs',
      timestamps: false,
      indexes: [{ unique: true, name: 'uq_habit_logs_habit_date', fields: ['habit_id', 'log_date'] }],
    }
  );
