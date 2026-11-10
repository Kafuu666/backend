module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      // Hash bcrypt, bukan teks asli
      password: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: 'users',
      // Password tidak ikut terambil kecuali memakai User.unscoped()
      defaultScope: { attributes: { exclude: ['password'] } },
    }
  );
  return User;
};
