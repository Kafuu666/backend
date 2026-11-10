module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Habit',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      category_id: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon: { type: DataTypes.STRING(50), allowNull: true },
      frequency: { type: DataTypes.ENUM('DAILY', 'WEEKLY'), allowNull: false, defaultValue: 'DAILY' },
      target_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      reminder_time: { type: DataTypes.TIME, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'habits' }
  );
