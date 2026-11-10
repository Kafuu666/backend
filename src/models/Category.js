module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Category',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      // NULL = kategori bawaan sistem
      user_id: { type: DataTypes.BIGINT, allowNull: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      color: { type: DataTypes.STRING(20), allowNull: true },
    },
    { tableName: 'categories' }
  );
