const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const serializeUser = (u) => ({
  id: Number(u.id),
  name: u.name,
  email: u.email,
  created_at: u.created_at,
});

const signToken = (user) =>
  jwt.sign({ sub: String(user.id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

async function register({ name, email, password }) {
  const existing = await User.unscoped().findOne({ where: { email } });
  if (existing) throw new ApiError(409, 'Email sudah terdaftar');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  return { user: serializeUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  const user = await User.unscoped().findOne({ where: { email } });
  // Pesan sama untuk email tidak ditemukan / password salah agar tidak membocorkan akun terdaftar
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!valid) throw new ApiError(401, 'Email atau password salah');
  return { user: serializeUser(user), token: signToken(user) };
}

module.exports = { register, login, serializeUser };
