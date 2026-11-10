const env = require('./config/env');
const app = require('./app');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('Koneksi database berhasil');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Gagal terhubung ke database. Periksa konfigurasi .env dan pastikan MariaDB berjalan.');
    // eslint-disable-next-line no-console
    console.error(err.message);
    process.exit(1);
  }

  // 0.0.0.0 agar dapat diakses dari emulator/perangkat Android di jaringan yang sama
  app.listen(env.port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`HabitTrack API berjalan di http://0.0.0.0:${env.port}/api/v1`);
  });
}

start();
