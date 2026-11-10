// Dipakai oleh aplikasi (database.js) dan oleh sequelize-cli (migration & seeder).
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'habittrack_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  // MariaDB kompatibel dengan dialect "mysql" milik Sequelize
  dialect: process.env.DB_DIALECT || 'mysql',
  ...(process.env.DB_STORAGE ? { storage: process.env.DB_STORAGE } : {}),
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  // BIGINT dikembalikan sebagai Number selama masih aman, sehingga id di JSON berupa angka
  dialectOptions: {
    supportBigNumbers: true,
    bigNumberStrings: false,
  },
};

module.exports = {
  development: { ...base },
  test: { ...base, database: process.env.DB_NAME_TEST || 'habittrack_db_test' },
  production: { ...base },
};
