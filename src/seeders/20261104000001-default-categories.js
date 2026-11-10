'use strict';

const DEFAULTS = [
  { name: 'Education', color: '#8B5CF6' },
  { name: 'Health', color: '#22C55E' },
  { name: 'Lifestyle', color: '#F59E0B' },
  { name: 'Productivity', color: '#38BDF8' },
];

module.exports = {
  async up(queryInterface) {
    // Aman dijalankan berulang: lewati bila kategori bawaan sudah ada
    const [rows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS total FROM categories WHERE user_id IS NULL'
    );
    if (Number(rows[0].total) > 0) return;

    const now = new Date();
    await queryInterface.bulkInsert(
      'categories',
      DEFAULTS.map((c) => ({ user_id: null, name: c.name, color: c.color, created_at: now, updated_at: now }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', { user_id: null });
  },
};
