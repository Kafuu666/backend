const { Op } = require('sequelize');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

const serialize = (c) => ({
  id: Number(c.id),
  name: c.name,
  color: c.color,
  is_default: c.user_id == null,
  user_id: c.user_id == null ? null : Number(c.user_id),
});

async function list(userId) {
  const rows = await Category.findAll({
    where: { [Op.or]: [{ user_id: null }, { user_id: userId }] },
    order: [
      ['user_id', 'ASC'],
      ['name', 'ASC'],
    ],
  });
  return rows.map(serialize);
}

async function create(userId, data) {
  const category = await Category.create({ user_id: userId, name: data.name, color: data.color || null });
  return serialize(category);
}

// Kategori bawaan tidak boleh diubah/dihapus; kategori milik orang lain dianggap tidak ada
async function findEditable(userId, id) {
  const category = await Category.findByPk(id);
  if (!category || (category.user_id != null && Number(category.user_id) !== Number(userId))) {
    throw new ApiError(404, 'Kategori tidak ditemukan');
  }
  if (category.user_id == null) throw new ApiError(403, 'Kategori bawaan tidak dapat diubah atau dihapus');
  return category;
}

async function update(userId, id, data) {
  const category = await findEditable(userId, id);
  await category.update({
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.color !== undefined ? { color: data.color || null } : {}),
  });
  return serialize(category);
}

async function remove(userId, id) {
  const category = await findEditable(userId, id);
  await category.destroy(); // habits.category_id menjadi NULL (ON DELETE SET NULL)
}

module.exports = { list, create, update, remove };
