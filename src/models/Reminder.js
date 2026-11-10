module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Reminder',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      habit_id: { type: DataTypes.BIGINT, allowNull: false },
      reminder_time: { type: DataTypes.TIME, allowNull: false },
      is_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'reminders', timestamps: false }
  );
