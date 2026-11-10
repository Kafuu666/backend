const env = require('./config/env');
const app = require('./app');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil terhubung');
  } catch (err) {
    console.error('❌ Gagal terhubung ke database. Periksa kredensial DB_HOST, DB_USER, dll.');
    console.error(err.message);
    process.exit(1);
  }

  // 0.0.0.0 wajib digunakan untuk cloud deployment (Render, dll)
  const PORT = env.port || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HabitTrack API berjalan pada port ${PORT}`);
  });
}

start();