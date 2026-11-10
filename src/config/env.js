require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET belum diatur. Salin .env.example menjadi .env lalu isi JWT_SECRET.');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  appTimezone: process.env.APP_TIMEZONE || 'Asia/Jakarta',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
