const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Identitas pengguna HANYA diambil dari JWT, tidak pernah dari body/query request.
module.exports = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Token autentikasi diperlukan');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Token tidak valid atau sudah kedaluwarsa');
  }

  const user = await User.findByPk(payload.sub);
  if (!user) throw new ApiError(401, 'Akun tidak ditemukan');

  req.user = user;
  next();
});
