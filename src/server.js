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

  // Hanya jalankan app.listen saat berjalan di lokal komputer Anda, BUKAN di Vercel
  if (process.env.NODE_ENV !== 'production') {
    const PORT = env.port || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HabitTrack API berjalan pada port ${PORT}`);
    });
  }
}

start();

// WAJIB ditambahkan agar Vercel bisa memproses routing Express
module.exports = app;